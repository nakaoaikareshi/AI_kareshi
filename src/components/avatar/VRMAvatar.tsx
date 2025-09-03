'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AvatarSettings } from '@/types';
import { useBackgroundStore } from '@/store/backgroundStore';

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
  const { background } = useBackgroundStore();

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

      // 腕を組む（常時）- 前で組む
      const leftUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightUpperArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightUpperArm');
      const leftLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('leftLowerArm');
      const rightLowerArm = vrmRef.current.humanoid.getNormalizedBoneNode('rightLowerArm');
      
      // 腕を前で組む
      if (leftUpperArm) {
        leftUpperArm.rotation.x = Math.PI * 0.2;  // 前に出す（正の値）
        leftUpperArm.rotation.y = Math.PI * 0.1;  // 内側に向ける
        leftUpperArm.rotation.z = -Math.PI * 0.1; // わずかに下げる
      }
      if (rightUpperArm) {
        rightUpperArm.rotation.x = Math.PI * 0.2;  // 前に出す（正の値）
        rightUpperArm.rotation.y = -Math.PI * 0.1; // 内側に向ける
        rightUpperArm.rotation.z = Math.PI * 0.1;  // わずかに下げる
      }
      if (leftLowerArm) {
        leftLowerArm.rotation.x = 0;
        leftLowerArm.rotation.y = Math.PI * 0.5;  // 肘を曲げて内側へ
        leftLowerArm.rotation.z = 0;
      }
      if (rightLowerArm) {
        rightLowerArm.rotation.x = 0;
        rightLowerArm.rotation.y = -Math.PI * 0.5; // 肘を曲げて内側へ
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
        
        // 背景設定の適用
        console.log('Background settings:', background); // デバッグ用
        
        // テクスチャローダー
        const textureLoader = new THREE.TextureLoader();
        
        if (background && background.type === 'preset') {
          // プリセット背景画像のURLマッピング
          const presetBackgrounds: Record<string, string> = {
            bedroom: 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=1920&h=1080&fit=crop',
            living: 'https://images.unsplash.com/photo-1565183928294-7d21b36c9c24?w=1920&h=1080&fit=crop',
            cafe: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&h=1080&fit=crop',
            park: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1920&h=1080&fit=crop',
            beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop',
            city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop',
            school: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&h=1080&fit=crop',
            library: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop',
          };
          
          const bgUrl = presetBackgrounds[background.presetId || 'bedroom'];
          if (bgUrl) {
            textureLoader.load(
              bgUrl,
              (texture) => {
                // 背景を平面として追加（適切なスケール）
                const backgroundGeometry = new THREE.PlaneGeometry(8, 6);
                const backgroundMaterial = new THREE.MeshBasicMaterial({ 
                  map: texture,
                  side: THREE.DoubleSide
                });
                const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
                backgroundMesh.position.z = -3; // キャラクターの後ろに配置
                backgroundMesh.position.y = 1.5; // 高さを調整
                scene.add(backgroundMesh);
                
                // シーンの背景色も設定
                scene.background = new THREE.Color('#F5F5F5');
                console.log('Applied preset background image:', bgUrl);
              },
              undefined,
              (error) => {
                console.error('Failed to load background image:', error);
                // フォールバックとして色を使用
                scene.background = new THREE.Color('#FFF5F5');
              }
            );
          }
        } else if (background && background.type === 'room' && background.roomConfig) {
          // ルームカスタマイズの場合
          scene.background = new THREE.Color(background.roomConfig.wallColor);
          
          // 床の追加
          const floorGeometry = new THREE.PlaneGeometry(10, 10);
          const floorColors: Record<string, string> = {
            wood: '#8B4513',
            carpet: '#696969',
            tile: '#E0E0E0',
          };
          const floorMaterial = new THREE.MeshPhongMaterial({ 
            color: floorColors[background.roomConfig.floorType] || '#8B4513',
            side: THREE.DoubleSide
          });
          const floor = new THREE.Mesh(floorGeometry, floorMaterial);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = -1.5;
          scene.add(floor);
        } else {
          // デフォルト背景（寝室の画像）
          textureLoader.load(
            'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=1920&h=1080&fit=crop',
            (texture) => {
              // 背景を平面として追加（適切なスケール）
              const backgroundGeometry = new THREE.PlaneGeometry(8, 6);
              const backgroundMaterial = new THREE.MeshBasicMaterial({ 
                map: texture,
                side: THREE.DoubleSide
              });
              const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
              backgroundMesh.position.z = -3; // キャラクターの後ろに配置
              backgroundMesh.position.y = 1.5; // 高さを調整
              scene.add(backgroundMesh);
              
              // シーンの背景色も設定
              scene.background = new THREE.Color('#F5F5F5');
              console.log('Applied default background image');
            },
            undefined,
            (error) => {
              console.error('Failed to load default background image:', error);
              scene.background = new THREE.Color('#FFF5F5');
            }
          );
        }
        
        sceneRef.current = scene;

        // ライティング設定
        let ambientColor = 0xffffff;
        let directionalColor = 0xffffff;
        const ambientIntensity = 0.6;
        const directionalIntensity = 0.4;
        
        if (background.type === 'room' && background.roomConfig) {
          // 照明タイプに応じた色温度の設定
          switch (background.roomConfig.lighting) {
            case 'warm':
              ambientColor = 0xFFE4B5;
              directionalColor = 0xFFD700;
              break;
            case 'cool':
              ambientColor = 0xE0F2FF;
              directionalColor = 0xADD8E6;
              break;
            case 'natural':
            default:
              ambientColor = 0xffffff;
              directionalColor = 0xffffff;
              break;
          }
        }
        
        const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(directionalColor, directionalIntensity);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
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
          alpha: false // 背景を表示するためalphaを無効に
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
            
            // 腕を前で組む（初期ポーズ）
            if (leftUpperArm) {
              leftUpperArm.rotation.x = Math.PI * 0.2;  // 前に出す
              leftUpperArm.rotation.y = Math.PI * 0.1;  // 内側に向ける
              leftUpperArm.rotation.z = -Math.PI * 0.1; // わずかに下げる
            }
            if (rightUpperArm) {
              rightUpperArm.rotation.x = Math.PI * 0.2;  // 前に出す
              rightUpperArm.rotation.y = -Math.PI * 0.1; // 内側に向ける
              rightUpperArm.rotation.z = Math.PI * 0.1;  // わずかに下げる
            }
            
            // 肘を曲げて前で腕を組む
            if (leftLowerArm) {
              leftLowerArm.rotation.x = 0;
              leftLowerArm.rotation.y = Math.PI * 0.5;  // 肘を曲げて内側へ
              leftLowerArm.rotation.z = 0;
            }
            if (rightLowerArm) {
              rightLowerArm.rotation.x = 0;
              rightLowerArm.rotation.y = -Math.PI * 0.5; // 肘を曲げて内側へ
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
  }, [width, height, avatar.vrmUrl, background]);

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