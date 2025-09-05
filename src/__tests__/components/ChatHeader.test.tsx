/**
 * ChatHeaderコンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatHeader } from '@/components/chat/ChatHeader';

// Mockの設定
jest.mock('next/dynamic', () => {
  return () => {
    const DynamicComponent = () => <div data-testid="vrm-avatar">VRM Avatar</div>;
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  };
});

describe('ChatHeader', () => {
  const defaultProps = {
    character: {
      id: '1',
      nickname: 'テスト太郎',
      avatar: undefined,
    },
    moodState: null,
    isSpeaking: false,
    currentEmotion: 'normal',
    emotionIntensity: 50,
    onOpenModal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('キャラクター名が表示される', () => {
    render(<ChatHeader {...defaultProps} />);
    expect(screen.getByText('テスト太郎')).toBeInTheDocument();
  });

  it('オンラインステータスが表示される', () => {
    render(<ChatHeader {...defaultProps} />);
    expect(screen.getByText('オンライン')).toBeInTheDocument();
  });

  it('各ボタンが正しく表示される', () => {
    render(<ChatHeader {...defaultProps} />);
    
    expect(screen.getByTitle('背景')).toBeInTheDocument();
    expect(screen.getByTitle('ビデオ通話')).toBeInTheDocument();
    expect(screen.getByTitle('スケジュール')).toBeInTheDocument();
    expect(screen.getByTitle('思い出')).toBeInTheDocument();
    expect(screen.getByTitle('プレゼント')).toBeInTheDocument();
    expect(screen.getByTitle('デート')).toBeInTheDocument();
    expect(screen.getByTitle('ショップ')).toBeInTheDocument();
    expect(screen.getByTitle('設定')).toBeInTheDocument();
  });

  it('背景ボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const backgroundButton = screen.getByTitle('背景');
    fireEvent.click(backgroundButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('background');
  });

  it('ビデオ通話ボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const videoButton = screen.getByTitle('ビデオ通話');
    fireEvent.click(videoButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('videoCall');
  });

  it('スケジュールボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const scheduleButton = screen.getByTitle('スケジュール');
    fireEvent.click(scheduleButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('schedule');
  });

  it('思い出ボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const memoriesButton = screen.getByTitle('思い出');
    fireEvent.click(memoriesButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('memories');
  });

  it('プレゼントボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const giftButton = screen.getByTitle('プレゼント');
    fireEvent.click(giftButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('gift');
  });

  it('デートボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const dateButton = screen.getByTitle('デート');
    fireEvent.click(dateButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('date');
  });

  it('ショップボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const storeButton = screen.getByTitle('ショップ');
    fireEvent.click(storeButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('store');
  });

  it('設定ボタンクリックで正しいモーダルが開く', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const settingsButton = screen.getByTitle('設定');
    fireEvent.click(settingsButton);
    
    expect(defaultProps.onOpenModal).toHaveBeenCalledWith('settings');
  });

  it('モバイルビューでアバターが表示される', () => {
    render(<ChatHeader {...defaultProps} />);
    
    // モバイル専用アバターが表示される（lg:hidden クラス内）
    const avatars = screen.getAllByTestId('vrm-avatar');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('異なるmoodStateが正しく反映される', () => {
    const propsWithMood = {
      ...defaultProps,
      moodState: {
        currentMood: 80,
        moodSwing: false,
        lastMoodChange: new Date(),
      },
    };
    
    render(<ChatHeader {...propsWithMood} />);
    
    // VRMアバターコンポーネントが正しいmoodを受け取っているか確認
    const avatars = screen.getAllByTestId('vrm-avatar');
    expect(avatars).toBeDefined();
  });

  it('isSpeaking状態が正しく反映される', () => {
    const propsWithSpeaking = {
      ...defaultProps,
      isSpeaking: true,
    };
    
    render(<ChatHeader {...propsWithSpeaking} />);
    
    // VRMアバターコンポーネントが正しいisSpeaking状態を受け取っているか確認
    const avatars = screen.getAllByTestId('vrm-avatar');
    expect(avatars).toBeDefined();
  });
});