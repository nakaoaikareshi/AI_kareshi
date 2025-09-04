/**
 * useModalManagerフックのテスト
 */

import { renderHook, act } from '@testing-library/react';
import { useModalManager } from '@/hooks/useModalManager';

describe('useModalManager', () => {
  it('初期状態ですべてのモーダルが閉じている', () => {
    const { result } = renderHook(() => useModalManager());
    
    expect(result.current.modals).toEqual({
      settings: false,
      store: false,
      date: false,
      gift: false,
      memories: false,
      schedule: false,
      videoCall: false,
      background: false,
    });
  });

  it('openModalで特定のモーダルが開く', () => {
    const { result } = renderHook(() => useModalManager());
    
    act(() => {
      result.current.openModal('settings');
    });
    
    expect(result.current.modals.settings).toBe(true);
    expect(result.current.modals.store).toBe(false);
  });

  it('closeModalで特定のモーダルが閉じる', () => {
    const { result } = renderHook(() => useModalManager());
    
    act(() => {
      result.current.openModal('settings');
    });
    
    expect(result.current.modals.settings).toBe(true);
    
    act(() => {
      result.current.closeModal('settings');
    });
    
    expect(result.current.modals.settings).toBe(false);
  });

  it('toggleModalでモーダルの開閉が切り替わる', () => {
    const { result } = renderHook(() => useModalManager());
    
    expect(result.current.modals.gift).toBe(false);
    
    act(() => {
      result.current.toggleModal('gift');
    });
    
    expect(result.current.modals.gift).toBe(true);
    
    act(() => {
      result.current.toggleModal('gift');
    });
    
    expect(result.current.modals.gift).toBe(false);
  });

  it('closeAllModalsですべてのモーダルが閉じる', () => {
    const { result } = renderHook(() => useModalManager());
    
    act(() => {
      result.current.openModal('settings');
      result.current.openModal('store');
      result.current.openModal('date');
    });
    
    expect(result.current.modals.settings).toBe(true);
    expect(result.current.modals.store).toBe(true);
    expect(result.current.modals.date).toBe(true);
    
    act(() => {
      result.current.closeAllModals();
    });
    
    expect(result.current.modals.settings).toBe(false);
    expect(result.current.modals.store).toBe(false);
    expect(result.current.modals.date).toBe(false);
  });
});