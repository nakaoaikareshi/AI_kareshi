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

  // アイドルモーション（自然な待機動作）
  const setupIdleMotion = useCallback((vrm: VRM) => {
    if (!vrm || !vrm.humanoid) return;

    const animate = () => {
      if (!vrmRef.current || !clockRef.current) return;

      const deltaTime = clockRef.current.getDelta();
      const time = clockRef.current.getElapsedTime();

      // 呼吸アニメーション（控えめ）
      const spine = vrmRef.current.humanoid.getNormalizedBoneNode('spine');
      const upperChest = vrmRef.current.humanoid.getNormalizedBoneNode('upperChest');
      if (spine) {
        spine.rotation.x = Math.sin(time * 1.0) * 0.003; // 呼吸
      }
      if (upperChest) {
        upperChest.rotation.x = Math.sin(time * 1.0 + Math.PI * 0.5) * 0.002;
      }

      // 頭の自然な動き（たまに見回す）
      const neck = vrmRef.current.humanoid.getNormalizedBoneNode('neck');
      const head = vrmRef.current.humanoid.getNormalizedBoneNode('head');
      if (neck) {
        neck.rotation.y = Math.sin(time * 0.3) * 0.05; // ゆっくり左右を見る
        neck.rotation.x = Math.sin(time * 0.4) * 0.02; // わずかな上下
      }
      if (head) {
        head.rotation.y = Math.sin(time * 0.3 + Math.PI * 0.3) * 0.03;
      }

      // 腕を組む（常時）
      const leftUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightUpperArm');
      const leftLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftLowerArm');
      const rightLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightLowerArm');
      
      // 腕を組む
      if (leftUpperArm) {
        leftUpperArm.rotation.x = -Math.PI * 0.1;
        leftUpperArm.rotation.y = Math.PI * 0.15;
        leftUpperArm.rotation.z = -Math.PI * 0.15;
      }
      if (rightUpperArm) {
        rightUpperArm.rotation.x = -Math.PI * 0.1;
        rightUpperArm.rotation.y = -Math.PI * 0.15;
        rightUpperArm.rotation.z = Math.PI * 0.15;
      }
      if (leftLowerArm) {
        leftLowerArm.rotation.x = 0;
        leftLowerArm.rotation.y = Math.PI * 0.4;
        leftLowerArm.rotation.z = 0;
      }
      if (rightLowerArm) {
        rightLowerArm.rotation.x = 0;
        rightLowerArm.rotation.y = -Math.PI * 0.4;
        rightLowerArm.rotation.z = 0;
      }

      // 重心移動（立ち姿勢を変える）
      const hips = vrmRef.current.humanoid.getNormalizedBoneNode('hips');
      if (hips) {
        // 体重移動のシミュレーション
        hips.position.x = Math.sin(time * 0.2) * 0.02; // 左右に体重移動
        hips.position.y = Math.sin(time * 0.4) * 0.01; // わずかな上下動
        hips.rotation.y = Math.sin(time * 0.15) * 0.02; // わずかに体を向ける
      }

      // 足の動き（軽く足踏み）
      const leftUpperLeg = vrmRef.current.humanoid.getNormalizedBoneNode('leftUpperLeg');
      const rightUpperLeg = vrmRef.current.humanoid.getNormalizedBoneNode('rightUpperLeg');
      if (leftUpperLeg && rightUpperLeg) {
        // たまに足を動かす（体重移動に合わせて）
        const walkCycle = Math.sin(time * 0.2);
        if (Math.abs(walkCycle) > 0.8) {
          leftUpperLeg.rotation.x = Math.sin(time * 2) * 0.02;
          rightUpperLeg.rotation.x = Math.sin(time * 2 + Math.PI) * 0.02;
        }
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
          45,  // 視野角を広げて全身を表示
          width / height,
          0.1,
          1000
        );
        camera.position.set(0, 1.0, 2.5);  // カメラを正面に配置
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
        controls.target.set(0, 1.0, 0);  // カメラターゲットを体の中心に設定
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.minDistance = 1.5;
        controls.maxDistance = 4.0;

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
          
          // モデルのスケール調整（全身がしっかり見えるサイズ）
          vrm.scene.scale.set(0.9, 0.9, 0.9);  // 少し縮小して全体を表示
          
          // シーンに追加
          scene.add(vrm.scene);
          vrmRef.current = vrm;

          // モデルの位置を調整（頭がコンテナ上端、全身が見えるように）
          vrm.scene.position.set(0, -0.5, 0);  // モデルを下げて全身を表示

          // 初期ポーズ設定（T-ポーズから自然な立ちポーズへ）
          if (vrm.humanoid) {
            // シンプルで自然な腕のポジション
            const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
            const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
            const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
            const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');
            
            // 腕を組む（初期ポーズ）
            if (leftUpperArm) {
              leftUpperArm.rotation.x = -Math.PI * 0.1;
              leftUpperArm.rotation.y = Math.PI * 0.15;
              leftUpperArm.rotation.z = -Math.PI * 0.15;
            }
            if (rightUpperArm) {
              rightUpperArm.rotation.x = -Math.PI * 0.1;
              rightUpperArm.rotation.y = -Math.PI * 0.15;
              rightUpperArm.rotation.z = Math.PI * 0.15;
            }
            
            // 肘を曲げて腕を組む
            if (leftLowerArm) {
              leftLowerArm.rotation.x = 0;
              leftLowerArm.rotation.y = Math.PI * 0.4;
              leftLowerArm.rotation.z = 0;
            }
            if (rightLowerArm) {
              rightLowerArm.rotation.x = 0;
              rightLowerArm.rotation.y = -Math.PI * 0.4;
              rightLowerArm.rotation.z = 0;
            }
            
            // 手首は自然な状態に
            const leftHand = vrm.humanoid.getNormalizedBoneNode('leftHand');
            const rightHand = vrm.humanoid.getNormalizedBoneNode('rightHand');
            if (leftHand) {
              // 手首はデフォルトのまま
            }
            if (rightHand) {
              // 手首はデフォルトのまま
            }
            
            // 体は自然な状態に
            const spine = vrm.humanoid.getNormalizedBoneNode('spine');
            const neck = vrm.humanoid.getNormalizedBoneNode('neck');
            
            if (spine) {
              // 背骨はデフォルトのまま
            }
            if (neck) {
              // 首もデフォルトのまま
            }
          }

          // カメラのターゲットを全身が見えるように設定（頭がコンテナ上端に）
          const head = vrm.humanoid?.getNormalizedBoneNode('head');
          if (head) {
            // 頭の位置を取得
            const headWorldPosition = new THREE.Vector3();
            head.getWorldPosition(headWorldPosition);
            
            // 頭がコンテナの上端に来るようにカメラを調整
            // コンテナの高さに基づいて計算
            const containerAspect = width / height;
            const fov = 45 * (Math.PI / 180); // ラジアンに変換
            const distance = 2.5;
            const visibleHeight = 2 * Math.tan(fov / 2) * distance;
            
            // 頭をコンテナ上端に配置するための調整
            const targetY = headWorldPosition.y - visibleHeight * 0.45; // 頭を上端近くに
            
            // カメラのターゲットとポジションを設定
            controls.target.set(0, targetY, 0);
            camera.position.set(0, targetY, distance);
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