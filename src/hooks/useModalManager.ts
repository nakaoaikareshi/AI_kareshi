/**
 * モーダル管理用カスタムフック
 * 複数のモーダルの開閉状態を管理
 */

import { useState, useCallback } from 'react';

export interface ModalStates {
  settings: boolean;
  store: boolean;
  date: boolean;
  gift: boolean;
  memories: boolean;
  schedule: boolean;
  videoCall: boolean;
  background: boolean;
}

export type ModalType = keyof ModalStates;

export const useModalManager = () => {
  const [modals, setModals] = useState<ModalStates>({
    settings: false,
    store: false,
    date: false,
    gift: false,
    memories: false,
    schedule: false,
    videoCall: false,
    background: false,
  });

  const openModal = useCallback((modalType: ModalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: true,
    }));
  }, []);

  const closeModal = useCallback((modalType: ModalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: false,
    }));
  }, []);

  const toggleModal = useCallback((modalType: ModalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: !prev[modalType],
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({
      settings: false,
      store: false,
      date: false,
      gift: false,
      memories: false,
      schedule: false,
      videoCall: false,
      background: false,
    });
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
  };
};