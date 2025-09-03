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
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 500, height: 500 },
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

  // アイドルモーション（呼吸・揺れ・自然な動き）
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

      // 腕の自然な揺れとリラックスした動き
      const leftUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightUpperArm');
      const leftLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftLowerArm');
      const rightLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightLowerArm');
      
      if (leftUpperArm) {
        leftUpperArm.rotation.z = leftUpperArmBase + Math.sin(time * 0.7) * 0.03;
        leftUpperArm.rotation.x = leftUpperArmXBase + Math.sin(time * 0.9) * 0.02;
        leftUpperArm.rotation.y = Math.sin(time * 0.6) * 0.01;
      }
      if (rightUpperArm) {
        rightUpperArm.rotation.z = rightUpperArmBase + Math.sin(time * 0.7 + Math.PI) * 0.03;
        rightUpperArm.rotation.x = rightUpperArmXBase + Math.sin(time * 0.9 + Math.PI) * 0.02;
        rightUpperArm.rotation.y = Math.sin(time * 0.6 + Math.PI) * 0.01;
      }
      if (leftLowerArm) {
        leftLowerArm.rotation.y = Math.PI * 0.05 + Math.sin(time * 1.1) * 0.02;
        leftLowerArm.rotation.z = -Math.PI * 0.02 + Math.sin(time * 0.8) * 0.01;
      }
      if (rightLowerArm) {
        rightLowerArm.rotation.y = -Math.PI * 0.05 + Math.sin(time * 1.1 + Math.PI) * 0.02;
        rightLowerArm.rotation.z = Math.PI * 0.02 + Math.sin(time * 0.8 + Math.PI) * 0.01;
      }

      // 手の細かな動き
      const leftHand = vrmRef.current.humanoid.getNormalizedBoneNode('leftHand');
      const rightHand = vrmRef.current.humanoid.getNormalizedBoneNode('rightHand');
      if (leftHand) {
        leftHand.rotation.x = Math.PI * 0.03 + Math.sin(time * 1.5) * 0.01;
        leftHand.rotation.z = -Math.PI * 0.02 + Math.sin(time * 2) * 0.005;
      }
      if (rightHand) {
        rightHand.rotation.x = Math.PI * 0.03 + Math.sin(time * 1.5 + Math.PI) * 0.01;
        rightHand.rotation.z = Math.PI * 0.02 + Math.sin(time * 2 + Math.PI) * 0.005;
      }

      // 重心の移動（腰の動き）
      const hips = vrmRef.current.humanoid.getNormalizedBoneNode('hips');
      if (hips) {
        hips.rotation.x = -Math.PI * 0.01 + Math.sin(time * 0.4) * 0.003;
        hips.rotation.y = Math.sin(time * 0.3) * 0.005;
        hips.position.x = Math.sin(time * 0.3) * 0.01; // わずかな左右の重心移動
        hips.position.y = Math.sin(time * 0.6) * 0.005; // わずかな上下動
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
          30,
          width / height,
          0.1,
          1000
        );
        camera.position.set(0, 1.0, 4.5);
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
        controls.target.set(0, 0.75, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.minDistance = 3.0;
        controls.maxDistance = 6.0;

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
          
          // モデルのスケール調整（必要に応じて調整）
          vrm.scene.scale.set(1.0, 1.0, 1.0);
          
          // シーンに追加
          scene.add(vrm.scene);
          vrmRef.current = vrm;

          // モデルの位置を調整（中央に配置、足まで表示）
          vrm.scene.position.set(-0.1, -0.45, 0);

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

          // カメラのターゲットを体の中心に向ける
          const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
          const head = vrm.humanoid?.getNormalizedBoneNode('head');
          if (hips && head) {
            // 腰と頭の中間点をターゲットに設定
            const hipsWorldPosition = new THREE.Vector3();
            const headWorldPosition = new THREE.Vector3();
            hips.getWorldPosition(hipsWorldPosition);
            head.getWorldPosition(headWorldPosition);
            
            // 体の中心を計算
            const centerY = (hipsWorldPosition.y + headWorldPosition.y) / 2;
            controls.target.set(-0.1, centerY, 0);
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