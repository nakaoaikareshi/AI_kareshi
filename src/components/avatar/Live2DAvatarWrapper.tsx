import React, { Suspense, lazy } from 'react';
import { AvatarSettings } from '@/types';
import { FantasyAvatar } from './FantasyAvatar';

// Live2Dコンポーネントを動的インポート（クライアントサイドのみ）
const Live2DAvatar = lazy(() => 
  import('./Live2DAvatar').then(module => ({ default: module.Live2DAvatar }))
);

interface Live2DAvatarWrapperProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: 'normal' | 'happy' | 'sad' | 'angry' | 'surprised' | 'love';
}

export const Live2DAvatarWrapper: React.FC<Live2DAvatarWrapperProps> = (props) => {
  // SSR対策: サーバーサイドではFantasyAvatarを表示
  if (typeof window === 'undefined') {
    return <FantasyAvatar {...props} />;
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center" style={{
        width: props.size === 'small' ? 100 : props.size === 'large' ? 400 : 200,
        height: props.size === 'small' ? 100 : props.size === 'large' ? 400 : 200,
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">初期化中...</p>
        </div>
      </div>
    }>
      <Live2DAvatar {...props} />
    </Suspense>
  );
};