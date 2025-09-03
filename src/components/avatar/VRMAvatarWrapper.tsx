import React, { Suspense, lazy } from 'react';
import { AvatarSettings } from '@/types';
import { FantasyAvatar } from './FantasyAvatar';

// VRMコンポーネントを動的インポート（クライアントサイドのみ）
const VRMAvatar = lazy(() => 
  import('./VRMAvatar').then(module => ({ default: module.VRMAvatar }))
);

interface VRMAvatarWrapperProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised' | 'love';
}

export const VRMAvatarWrapper: React.FC<VRMAvatarWrapperProps> = (props) => {
  // SSR対策: サーバーサイドではFantasyAvatarを表示
  if (typeof window === 'undefined') {
    return <FantasyAvatar {...props} />;
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center" style={{
        width: props.size === 'small' ? 150 : props.size === 'large' ? 500 : 300,
        height: props.size === 'small' ? 150 : props.size === 'large' ? 500 : 300,
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">3D初期化中...</p>
        </div>
      </div>
    }>
      <VRMAvatar {...props} />
    </Suspense>
  );
};