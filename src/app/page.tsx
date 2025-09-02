'use client';

import React from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useUserStore } from '@/store/userStore';
import { useHydration } from '@/hooks/useHydration';
import { UserSetup } from '@/components/setup/UserSetup';
import { CharacterSetup } from '@/components/setup/CharacterSetup';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function Home() {
  const isHydrated = useHydration();
  const { isCharacterSetup } = useCharacterStore();
  const { isUserSetup } = useUserStore();

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      {!isUserSetup ? (
        <UserSetup />
      ) : !isCharacterSetup ? (
        <CharacterSetup />
      ) : (
        <ChatContainer />
      )}
    </div>
  );
}
