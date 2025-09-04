/**
 * アクセシビリティ関連のカスタムフック
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * フォーカストラップフック
 * モーダル内でフォーカスを循環させる
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // 現在のフォーカスを保存
    previousActiveElement.current = document.activeElement;

    // フォーカス可能な要素を取得
    const getFocusableElements = () => {
      const elements = containerRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return elements ? Array.from(elements) : [];
    };

    // 最初の要素にフォーカス
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // キーボードイベントハンドラー
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // 元のフォーカスを復元
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
};

/**
 * キーボードナビゲーションフック
 * 矢印キーでの要素間移動をサポート
 */
export const useArrowNavigation = (
  itemsSelector: string,
  options?: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
    onSelect?: (element: HTMLElement) => void;
  }
) => {
  const containerRef = useRef<HTMLElement>(null);
  const { loop = true, orientation = 'vertical', onSelect } = options || {};

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = Array.from(container.querySelectorAll(itemsSelector)) as HTMLElement[];
      if (items.length === 0) return;

      const currentIndex = items.findIndex(item => item === document.activeElement);
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : 0);
          }
          break;
        
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : items.length - 1);
          }
          break;
        
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : 0);
          }
          break;
        
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : items.length - 1);
          }
          break;
        
        case 'Enter':
        case ' ':
          if (currentIndex >= 0 && onSelect) {
            e.preventDefault();
            onSelect(items[currentIndex]);
          }
          break;
        
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== currentIndex && items[nextIndex]) {
        items[nextIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [itemsSelector, loop, orientation, onSelect]);

  return containerRef;
};

/**
 * アナウンス機能フック
 * スクリーンリーダーへの通知
 */
export const useAnnounce = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('');
    
    // 一瞬空にしてから新しいメッセージを設定（スクリーンリーダーのため）
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);

    // 自動的にクリア
    setTimeout(() => {
      setAnnouncement('');
    }, 3000);
  }, []);

  return {
    announcement,
    announce,
  };
};

/**
 * 動作設定の尊重フック
 * prefers-reduced-motion の検出
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * キーボードショートカットフック
 */
export const useKeyboardShortcut = (
  shortcuts: Array<{
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    handler: () => void;
    description?: string;
  }>
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return shortcuts;
};