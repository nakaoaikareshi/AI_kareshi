/**
 * アクセシブルなモーダルコンポーネント
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap, useKeyboardShortcut } from '@/hooks/useAccessibility';
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderOnly';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  footer,
}) => {
  const modalRef = useFocusTrap(isOpen);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descId = useRef(`modal-desc-${Math.random().toString(36).substr(2, 9)}`);

  // ESCキーでモーダルを閉じる
  useKeyboardShortcut([
    {
      key: 'Escape',
      handler: onClose,
      description: 'モーダルを閉じる',
    },
  ]);

  // body要素のスクロールを制御
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // スクリーンリーダーから他の要素を隠す
      document.getElementById('root')?.setAttribute('aria-hidden', 'true');
    } else {
      document.body.style.overflow = '';
      document.getElementById('root')?.removeAttribute('aria-hidden');
    }

    return () => {
      document.body.style.overflow = '';
      document.getElementById('root')?.removeAttribute('aria-hidden');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-lg',
    large: 'max-w-4xl',
    full: 'max-w-full m-4',
  };

  return (
    <>
      {/* ポータルの代わりに固定配置を使用 */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby={titleId.current}
        aria-describedby={description ? descId.current : undefined}
        aria-modal="true"
        role="dialog"
      >
        {/* オーバーレイ */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* モーダルコンテンツ */}
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div
            ref={modalRef}
            className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ${sizeClasses[size]} w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-white px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2
                  id={titleId.current}
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                    aria-label="閉じる"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}
              </div>
              {description && (
                <p
                  id={descId.current}
                  className="mt-1 text-sm text-gray-500"
                >
                  {description}
                </p>
              )}
            </div>

            {/* ボディ */}
            <div className="bg-white px-6 py-4 max-h-[60vh] overflow-y-auto">
              {children}
            </div>

            {/* フッター */}
            {footer && (
              <div className="bg-gray-50 px-6 py-4 border-t">
                {footer}
              </div>
            )}

            {/* キーボードナビゲーションのヒント */}
            <ScreenReaderOnly>
              ESCキーでこのモーダルを閉じることができます
            </ScreenReaderOnly>
          </div>
        </div>
      </div>
    </>
  );
};