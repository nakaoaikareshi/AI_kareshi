'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AvatarSettings } from '@/types';

interface VRMAvatarProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised' | 'love';
}

export const VRMAvatar: React.FC<VRMAvatarProps> = ({
  avatar,
  size = 'medium',
  mood = 50,
  isSpeaking = false,
  isBlinking = true,
  emotionState = 'normal',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // サイズ設定
  const dimensions = {
    small: { width: 150, height: 200 },
    medium: { width: 300, height: 400 },
    large: { width: 500, height: 650 },
  };

  const { width, height } = dimensions[size];

  // 表情設定
  const applyExpression = useCallback((vrm: VRM, emotion: string) => {
    if (!vrm || !vrm.expressionManager) return;

    // 全ての表情をリセット
    vrm.expressionManager.setValue('neutral', 0);
    vrm.expressionManager.setValue('happy', 0);
    vrm.expressionManager.setValue('sad', 0);
    vrm.expressionManager.setValue('angry', 0);
    vrm.expressionManager.setValue('surprised', 0);
    vrm.expressionManager.setValue('relaxed', 0);

    // 感情に応じた表情を設定
    switch (emotion) {
      case 'happy':
        vrm.expressionManager.setValue('happy', 1.0);
        break;
      case 'sad':
        vrm.expressionManager.setValue('sad', 1.0);
        break;
      case 'angry':
        vrm.expressionManager.setValue('angry', 1.0);
        break;
      case 'surprised':
        vrm.expressionManager.setValue('surprised', 1.0);
        break;
      case 'love':
        vrm.expressionManager.setValue('happy', 0.7);
        vrm.expressionManager.setValue('relaxed', 0.3);
        break;
      default:
        vrm.expressionManager.setValue('neutral', 1.0);
    }

    vrm.expressionManager.update();
  }, []);

  // まばたきアニメーション
  const setupBlinking = useCallback((vrm: VRM) => {
    if (!vrm || !vrm.expressionManager) return;

    const blink = () => {
      if (!vrmRef.current) return;
      
      // まばたきアニメーション
      vrmRef.current.expressionManager?.setValue('blink', 1.0);
      vrmRef.current.expressionManager?.update();
      
      setTimeout(() => {
        if (vrmRef.current) {
          vrmRef.current.expressionManager?.setValue('blink', 0);
          vrmRef.current.expressionManager?.update();
        }
      }, 150);

      // 次のまばたきまでのランダムな間隔
      const nextBlink = Math.random() * 3000 + 2000;
      setTimeout(blink, nextBlink);
    };

    // 初回まばたき開始
    setTimeout(blink, 1000);
  }, []);

  // 口パクアニメーション
  const setupLipSync = useCallback((vrm: VRM, speaking: boolean) => {
    if (!vrm || !vrm.expressionManager) return;

    if (speaking) {
      const lipSyncInterval = setInterval(() => {
        if (!vrmRef.current) {
          clearInterval(lipSyncInterval);
          return;
        }
        
        const value = Math.random() * 0.8;
        vrmRef.current.expressionManager?.setValue('aa', value);
        vrmRef.current.expressionManager?.update();
      }, 100);

      return () => clearInterval(lipSyncInterval);
    } else {
      vrm.expressionManager.setValue('aa', 0);
      vrm.expressionManager.update();
    }
  }, []);

  // アイドルモーション（呼吸・揺れ・身振り手振り）
  const setupIdleMotion = useCallback((vrm: VRM) => {
    if (!vrm || !vrm.humanoid) return;

    // 初期ポーズの腕の角度を保存
    const leftUpperArmBase = -Math.PI * 0.4;
    const rightUpperArmBase = Math.PI * 0.4;
    const leftUpperArmXBase = Math.PI * 0.05;
    const rightUpperArmXBase = Math.PI * 0.05;

    const animate = () => {
      if (!vrmRef.current || !clockRef.current) return;

      const deltaTime = clockRef.current.getDelta();
      const time = clockRef.current.getElapsedTime();

      // 呼吸アニメーション（胸部）
      const spine = vrmRef.current.humanoid.getNormalizedBoneNode('spine');
      const upperChest = vrmRef.current.humanoid.getNormalizedBoneNode('upperChest');
      if (spine) {
        spine.rotation.x = Math.PI * 0.01 + Math.sin(time * 1.2) * 0.005; // 呼吸による前後動
        spine.rotation.y = Math.sin(time * 0.5) * 0.01; // ゆっくりとした左右の揺れ
      }
      if (upperChest) {
        upperChest.rotation.x = Math.sin(time * 1.2 + Math.PI * 0.5) * 0.003;
      }

      // 頭と首の自然な動き
      const neck = vrmRef.current.humanoid.getNormalizedBoneNode('neck');
      const head = vrmRef.current.humanoid.getNormalizedBoneNode('head');
      if (neck) {
        neck.rotation.x = Math.PI * 0.01 + Math.sin(time * 1.5) * 0.015;
        neck.rotation.y = Math.PI * 0.01 + Math.sin(time * 0.8) * 0.02;
        neck.rotation.z = Math.sin(time * 1.1) * 0.005;
      }
      if (head) {
        head.rotation.x = Math.sin(time * 1.3 + Math.PI * 0.3) * 0.01;
        head.rotation.y = Math.sin(time * 0.9 + Math.PI * 0.6) * 0.015;
      }

      // 身振り手振りアニメーション（大きくはっきりとした動き）
      const gestureTime = time * 0.8; // 動きを速く
      
      const leftUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightUpperArm');
      const leftLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftLowerArm');
      const rightLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightLowerArm');
      const leftHand = vrmRef.current.humanoid.getNormalizedBoneNode('leftHand');
      const rightHand = vrmRef.current.humanoid.getNormalizedBoneNode('rightHand');
      
      // 身振り手振りのパターン（5秒ごとに切り替え）
      const gesturePattern = Math.floor(time / 5) % 4;
      
      if (gesturePattern === 0) {
        // パターン1: 大きく手を振る（挨拶）
        if (rightUpperArm) {
          // 腕を高く上げる
          rightUpperArm.rotation.z = Math.PI * 0.6; // 大きく横に上げる
          rightUpperArm.rotation.x = -Math.PI * 0.3; // 前に出す
        }
        if (rightLowerArm) {
          // 肘から先を振る
          rightLowerArm.rotation.x = -Math.PI * 0.2;
          rightLowerArm.rotation.z = Math.sin(time * 5) * 0.4; // 速く大きく振る
        }
        if (rightHand) {
          // 手首も振る
          rightHand.rotation.z = Math.sin(time * 5) * 0.3;
        }
        // 左手は自然に下ろす
        if (leftUpperArm) {
          leftUpperArm.rotation.z = leftUpperArmBase;
        }
      } else if (gesturePattern === 1) {
        // パターン2: 両手を大きく広げる（説明・アピール）
        if (leftUpperArm) {
          leftUpperArm.rotation.z = -Math.PI * 0.7; // 左腕を大きく横に
          leftUpperArm.rotation.x = Math.sin(gestureTime) * 0.2;
          leftUpperArm.rotation.y = Math.PI * 0.2;
        }
        if (rightUpperArm) {
          rightUpperArm.rotation.z = Math.PI * 0.7; // 右腕を大きく横に
          rightUpperArm.rotation.x = Math.sin(gestureTime) * 0.2;
          rightUpperArm.rotation.y = -Math.PI * 0.2;
        }
        if (leftLowerArm) {
          leftLowerArm.rotation.y = Math.sin(gestureTime * 1.5) * 0.3;
        }
        if (rightLowerArm) {
          rightLowerArm.rotation.y = -Math.sin(gestureTime * 1.5) * 0.3;
        }
        // 手のひらを開く
        if (leftHand) {
          leftHand.rotation.x = -Math.PI * 0.1;
        }
        if (rightHand) {
          rightHand.rotation.x = -Math.PI * 0.1;
        }
      } else if (gesturePattern === 2) {
        // パターン3: 指さし（右手で前を指す）
        if (rightUpperArm) {
          rightUpperArm.rotation.z = Math.PI * 0.3;
          rightUpperArm.rotation.x = -Math.PI * 0.5; // 前方に腕を出す
          rightUpperArm.rotation.y = 0;
        }
        if (rightLowerArm) {
          rightLowerArm.rotation.x = -Math.PI * 0.1; // 腕をまっすぐ伸ばす
        }
        if (rightHand) {
          rightHand.rotation.x = 0;
          rightHand.rotation.z = Math.sin(time * 3) * 0.1; // 少し動かす
        }
        // 左手は腰に
        if (leftUpperArm) {
          leftUpperArm.rotation.z = -Math.PI * 0.3;
          leftUpperArm.rotation.x = Math.PI * 0.3;
        }
        if (leftLowerArm) {
          leftLowerArm.rotation.y = Math.PI * 0.5;
        }
      } else {
        // パターン4: ガッツポーズ（両手を握って上下）
        if (leftUpperArm) {
          leftUpperArm.rotation.z = -Math.PI * 0.2 + Math.sin(time * 3) * 0.2;
          leftUpperArm.rotation.x = -Math.PI * 0.3;
        }
        if (rightUpperArm) {
          rightUpperArm.rotation.z = Math.PI * 0.2 - Math.sin(time * 3) * 0.2;
          rightUpperArm.rotation.x = -Math.PI * 0.3;
        }
        if (leftLowerArm) {
          leftLowerArm.rotation.x = -Math.PI * 0.6;
        }
        if (rightLowerArm) {
          rightLowerArm.rotation.x = -Math.PI * 0.6;
        }
        // 手を握る
        if (leftHand) {
          leftHand.rotation.x = Math.PI * 0.3;
        }
        if (rightHand) {
          rightHand.rotation.x = Math.PI * 0.3;
        }
      }

      // 手の細かな追加動き（ジェスチャー以外の時）
      if (gesturePattern === -1) { // この条件は常にfalseなので実行されない（ジェスチャーアニメーションを優先）
        if (leftHand) {
          leftHand.rotation.x = Math.PI * 0.03 + Math.sin(time * 1.5) * 0.01;
          leftHand.rotation.z = -Math.PI * 0.02 + Math.sin(time * 2) * 0.005;
        }
        if (rightHand) {
          rightHand.rotation.x = Math.PI * 0.03 + Math.sin(time * 1.5 + Math.PI) * 0.01;
          rightHand.rotation.z = Math.PI * 0.02 + Math.sin(time * 2 + Math.PI) * 0.005;
        }
      }

      // 重心の移動（腰の動き）
      const hips = vrmRef.current.humanoid.getNormalizedBoneNode('hips');
      if (hips) {
        hips.rotation.x = -Math.PI * 0.01 + Math.sin(time * 0.4) * 0.003;
        hips.rotation.y = Math.sin(time * 0.3) * 0.005;
        hips.position.x = Math.sin(time * 0.3) * 0.01; // わずかな左右の重心移動
        hips.position.y = Math.sin(time * 0.6) * 0.005; // わずかな上下動（相対的）
      }

      // VRMの更新
      vrmRef.current.update(deltaTime);
    };

    return animate;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const init = async () => {
      try {
        setIsLoading(true);

        // シーン作成
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        // ライティング
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // カメラ
        const camera = new THREE.PerspectiveCamera(
          70,  // 視野角を調整して全身を収める
          width / height,
          0.1,
          1000
        );
        camera.position.set(0, 0.9, 1.8);  // カメラを真正面（目の高さ）に配置
        cameraRef.current = camera;

        // レンダラー
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        if (containerRef.current) {
          containerRef.current.appendChild(renderer.domElement);
        }
        rendererRef.current = renderer;

        // コントロール（デバッグ用、本番では無効化可能）
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.9, 0);  // 胸のあたりを見る（真正面）
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.minDistance = 1.2;
        controls.maxDistance = 3.0;

        // VRMローダー
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        // VRMモデルのURL（あなたが作成したキャラクターを使用）
        const modelUrl = avatar.vrmUrl || '/models/vrm/character.vrm';

        try {
          const gltf = await loader.loadAsync(modelUrl);
          const vrm = gltf.userData.vrm as VRM;

          // VRMの回転を修正
          VRMUtils.rotateVRM0(vrm);
          
          // モデルのスケール調整（少し小さくして全身を収める）
          vrm.scene.scale.set(0.85, 0.85, 0.85);  // 少し縮小
          
          // シーンに追加
          scene.add(vrm.scene);
          vrmRef.current = vrm;

          // モデルの位置を調整（中央に配置、全身表示）
          vrm.scene.position.set(0, -0.3, 0);  // モデルを上げて画面中央に配置

          // 初期ポーズ設定（T-ポーズから自然な立ちポーズへ）
          if (vrm.humanoid) {
            // より自然な腕のポジション
            const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
            const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
            const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
            const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');
            
            // 腕を自然に体の横に下ろす
            if (leftUpperArm) {
              leftUpperArm.rotation.z = -Math.PI * 0.4; // 72度下げる
              leftUpperArm.rotation.x = Math.PI * 0.05; // 少し前に
            }
            if (rightUpperArm) {
              rightUpperArm.rotation.z = Math.PI * 0.4; // 72度下げる
              rightUpperArm.rotation.x = Math.PI * 0.05; // 少し前に
            }
            
            // 肘を自然に曲げる
            if (leftLowerArm) {
              leftLowerArm.rotation.y = Math.PI * 0.05; // わずかに曲げる
              leftLowerArm.rotation.z = -Math.PI * 0.02;
            }
            if (rightLowerArm) {
              rightLowerArm.rotation.y = -Math.PI * 0.05; // わずかに曲げる
              rightLowerArm.rotation.z = Math.PI * 0.02;
            }
            
            // 手をリラックスさせる
            const leftHand = vrm.humanoid.getNormalizedBoneNode('leftHand');
            const rightHand = vrm.humanoid.getNormalizedBoneNode('rightHand');
            if (leftHand) {
              leftHand.rotation.x = Math.PI * 0.03;
              leftHand.rotation.z = -Math.PI * 0.02;
            }
            if (rightHand) {
              rightHand.rotation.x = Math.PI * 0.03;
              rightHand.rotation.z = Math.PI * 0.02;
            }
            
            // 体全体の自然なポーズ
            const spine = vrm.humanoid.getNormalizedBoneNode('spine');
            const hips = vrm.humanoid.getNormalizedBoneNode('hips');
            const neck = vrm.humanoid.getNormalizedBoneNode('neck');
            
            if (spine) {
              spine.rotation.x = Math.PI * 0.01; // わずかに前傾
            }
            if (hips) {
              hips.rotation.x = -Math.PI * 0.01; // 腰をわずかに引く
            }
            if (neck) {
              neck.rotation.x = Math.PI * 0.01; // 自然な首の角度
              neck.rotation.y = Math.PI * 0.01; // わずかに横を向く
            }
          }

          // カメラのターゲットを全身が見えるように設定
          const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
          if (hips) {
            // 腰の位置を取得
            const hipsWorldPosition = new THREE.Vector3();
            hips.getWorldPosition(hipsWorldPosition);
            
            // 腰の高さを基準に真正面から見る
            controls.target.set(0, hipsWorldPosition.y, 0);
            
            // カメラを腰の高さに合わせて真正面に配置
            camera.position.set(0, hipsWorldPosition.y, 1.8);
            controls.update();
          }

          // 初期表情設定
          applyExpression(vrm, emotionState);

          // まばたき設定
          if (isBlinking) {
            setupBlinking(vrm);
          }

          // 口パク設定
          setupLipSync(vrm, isSpeaking);

          // アイドルモーション設定
          const idleAnimation = setupIdleMotion(vrm);

          // アニメーションループ
          const animate = () => {
            requestAnimationFrame(animate);
            
            controls.update();
            
            if (idleAnimation) {
              idleAnimation();
            }

            renderer.render(scene, camera);
          };
          animate();

          setIsLoading(false);
          setError(null);
        } catch (loadError) {
          console.error('VRMモデルのロードに失敗:', loadError);
          setError('VRMモデルのロードに失敗しました');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('3D初期化エラー:', err);
        setError('3D表示の初期化に失敗しました');
        setIsLoading(false);
      }
    };

    init();

    // クリーンアップ
    return () => {
      const container = containerRef.current;
      const renderer = rendererRef.current;
      
      if (renderer) {
        renderer.dispose();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      if (vrmRef.current) {
        VRMUtils.deepDispose(vrmRef.current.scene);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, avatar.vrmUrl]);

  // 感情状態の変更を監視
  useEffect(() => {
    if (vrmRef.current) {
      applyExpression(vrmRef.current, emotionState);
    }
  }, [emotionState, applyExpression]);

  // 話している状態の変更を監視
  useEffect(() => {
    if (vrmRef.current) {
      return setupLipSync(vrmRef.current, isSpeaking);
    }
  }, [isSpeaking, setupLipSync]);

  if (error) {
    // エラー時はシンプルな代替表示
    return (
      <div className="flex items-center justify-center rounded-lg bg-gray-100" style={{ width, height }}>
        <div className="text-center">
          <p className="text-xs text-gray-500">3Dモデル読み込みエラー</p>
          <p className="text-xs text-gray-400 mt-1">VRMファイルを配置してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">3Dモデル読み込み中...</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`rounded-lg overflow-hidden ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        style={{ width, height }}
      />
    </div>
  );
};