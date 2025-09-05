'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { AvatarSettings } from '@/types';
import { useBackgroundStore } from '@/store/backgroundStore';
import { EmotionType } from '@/utils/emotionAnalyzer';
import { VRMSceneManager } from './vrm/VRMSceneManager';
import { VRMExpressionManager } from './vrm/VRMExpressionManager';
import { VRMAnimationManager } from './vrm/VRMAnimationManager';
import { vrmLoader } from './vrm/VRMLoader';

interface VRMAvatarOptimizedProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: EmotionType;
  emotionIntensity?: number;
}

// ローディングコンポーネント
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// エラー表示コンポーネント
const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full p-4">
    <div className="text-red-500 mb-2">⚠️</div>
    <div className="text-sm text-gray-600">{message}</div>
  </div>
);

/**
 * 最適化されたVRMアバターコンポーネント
 */
const VRMAvatarOptimizedComponent: React.FC<VRMAvatarOptimizedProps> = ({
  avatar,
  size = 'medium',
  mood = 50,
  isSpeaking = false,
  isBlinking = true,
  emotionState = 'normal',
  emotionIntensity = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<VRMSceneManager | null>(null);
  const expressionManagerRef = useRef<VRMExpressionManager | null>(null);
  const animationManagerRef = useRef<VRMAnimationManager | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { background } = useBackgroundStore();
  
  // サイズ設定
  const dimensions = {
    small: { width: 150, height: 200 },
    medium: { width: 300, height: 400 },
    large: { width: 500, height: 650 },
    xlarge: { width: 700, height: 900 },
  };
  
  const { width, height } = dimensions[size];
  
  /**
   * VRMモデルの読み込み
   */
  const loadVRMModel = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // VRMのURLを取得
      const vrmUrl = avatar.vrmUrl || '/models/default-avatar.vrm';
      
      // VRMモデルを読み込み（キャッシュ対応）
      const vrm = await vrmLoader.loadVRM(vrmUrl);
      vrmRef.current = vrm;
      
      // マネージャーにVRMを設定
      if (expressionManagerRef.current) {
        expressionManagerRef.current.setVRM(vrm);
      }
      if (animationManagerRef.current) {
        animationManagerRef.current.setVRM(vrm);
      }
      
      // シーンに追加
      if (sceneManagerRef.current) {
        sceneManagerRef.current.addToScene(vrm.scene);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('VRM読み込みエラー:', err);
      setError('アバターの読み込みに失敗しました');
      setIsLoading(false);
      
      // フォールバックモデルを試す
      try {
        const fallbackVrm = await vrmLoader.loadDefaultVRM();
        vrmRef.current = fallbackVrm;
        if (sceneManagerRef.current) {
          sceneManagerRef.current.addToScene(fallbackVrm.scene);
        }
      } catch (fallbackErr) {
        console.error('フォールバックモデルも読み込めませんでした:', fallbackErr);
      }
    }
  }, [avatar.vrmUrl]);
  
  /**
   * アニメーションループ
   */
  const animate = useCallback(() => {
    if (!sceneManagerRef.current) return;
    
    const deltaTime = 0.016; // 約60fps
    
    // 表情更新
    if (expressionManagerRef.current) {
      expressionManagerRef.current.update(deltaTime, isSpeaking, isBlinking);
    }
    
    // アニメーション更新
    if (animationManagerRef.current) {
      animationManagerRef.current.update(deltaTime, emotionState, emotionIntensity);
    }
    
    // レンダリング
    sceneManagerRef.current.render();
    
    // 次のフレーム
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isSpeaking, isBlinking, emotionState, emotionIntensity]);
  
  /**
   * 初期化
   */
  useEffect(() => {
    if (!containerRef.current) return;
    
    // シーンマネージャーの作成
    sceneManagerRef.current = new VRMSceneManager(containerRef.current, {
      width,
      height,
      background: {
        type: background.type === 'custom' ? 'image' : 'color',
        value: background.customUrl || undefined,
      },
    });
    
    // 表情マネージャーの作成
    expressionManagerRef.current = new VRMExpressionManager();
    
    // アニメーションマネージャーの作成
    animationManagerRef.current = new VRMAnimationManager();
    
    // VRMモデルを読み込み
    loadVRMModel();
    
    // アニメーション開始
    animate();
    
    // リサイズハンドラー
    const handleResize = () => {
      if (sceneManagerRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        sceneManagerRef.current.resize(rect.width, rect.height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // VRMのクリーンアップ
      if (vrmRef.current && sceneManagerRef.current) {
        sceneManagerRef.current.removeFromScene(vrmRef.current.scene);
      }
      
      // マネージャーのクリーンアップ
      expressionManagerRef.current?.dispose();
      animationManagerRef.current?.dispose();
      sceneManagerRef.current?.dispose();
      
      // コンテナのクリア
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, []); // 初回のみ実行
  
  /**
   * アバター変更時の処理
   */
  useEffect(() => {
    if (!vrmRef.current || !avatar.vrmUrl) return;
    
    // 既存のVRMと異なる場合のみ再読み込み
    const currentUrl = vrmRef.current.scene.userData.vrmUrl;
    if (currentUrl !== avatar.vrmUrl) {
      loadVRMModel();
    }
  }, [avatar.vrmUrl, loadVRMModel]);
  
  /**
   * 感情状態の更新
   */
  useEffect(() => {
    if (expressionManagerRef.current) {
      expressionManagerRef.current.applyEmotion(emotionState, emotionIntensity);
    }
  }, [emotionState, emotionIntensity]);
  
  /**
   * 背景の更新
   */
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateBackground({
        type: background.type === 'custom' ? 'image' : 'color',
        value: background.customUrl || undefined,
      });
    }
  }, [background]);
  
  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{ width, height }}
    >
      {isLoading && <LoadingSpinner />}
      {error && !isLoading && <ErrorDisplay message={error} />}
    </div>
  );
};

// React.memoでラップして最適化
export const VRMAvatarOptimized = memo(VRMAvatarOptimizedComponent);

// 遅延読み込み用のエクスポート
export const VRMAvatarLazy = dynamic(
  () => import('./VRMAvatarOptimized').then(mod => ({ default: mod.VRMAvatarOptimized })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // サーバーサイドレンダリングを無効化
  }
);