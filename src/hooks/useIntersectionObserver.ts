/**
 * Intersection Observer カスタムフック
 * 要素の可視性を監視して遅延読み込みを実装
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = ({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const frozen = useRef(false);

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
    setIsVisible(entry?.isIntersecting ?? false);

    // 一度表示されたら監視を停止
    if (entry?.isIntersecting && freezeOnceVisible) {
      frozen.current = true;
    }
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible]);

  return { elementRef, entry, isVisible };
};

/**
 * 複数要素の遅延読み込み用フック
 */
export const useLazyLoad = <T extends HTMLElement = HTMLDivElement>(
  options?: UseIntersectionObserverProps
) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<T>(null);
  const { isVisible } = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isVisible, hasLoaded]);

  return {
    ref: elementRef,
    isVisible,
    hasLoaded,
  };
};