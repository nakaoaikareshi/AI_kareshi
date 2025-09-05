/**
 * パフォーマンス最適化ユーティリティ
 */

/**
 * デバウンス関数
 * 高頻度のイベントを制限
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
};

/**
 * スロットル関数
 * 一定間隔でのみ関数を実行
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * メモ化関数
 * 計算結果をキャッシュ
 */
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    maxSize?: number;
    ttl?: number;
  }
): T => {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  const maxSize = options?.maxSize || 100;
  const ttl = options?.ttl || Infinity;

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached) {
      const isExpired = Date.now() - cached.timestamp > ttl;
      if (!isExpired) {
        return cached.value;
      }
    }

    const result = fn(...args);

    // キャッシュサイズ制限
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;
};

/**
 * 画像の遅延読み込みURL生成
 */
export const generateOptimizedImageUrl = (
  src: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string => {
  const { width = 800, quality = 75, format = 'auto' } = options;
  
  // Next.js の画像最適化APIを使用
  if (src.startsWith('/')) {
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
    });
    
    if (format !== 'auto') {
      params.append('fm', format);
    }
    
    return `/_next/image?${params.toString()}`;
  }
  
  return src;
};

/**
 * WebP対応チェック
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * AVIF対応チェック
 */
export const supportsAVIF = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 1);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A==';
  });
};

/**
 * リソースのプリロード
 */
export const preloadResource = (
  url: string,
  type: 'script' | 'style' | 'image' | 'font' | 'fetch'
): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;

  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'image':
      link.as = 'image';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
    case 'fetch':
      link.as = 'fetch';
      break;
  }

  document.head.appendChild(link);
};

/**
 * ネットワーク状態の取得
 */
export const getNetworkInfo = (): {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} | null => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  }
  return null;
};

/**
 * 低速ネットワーク検出
 */
export const isSlowNetwork = (): boolean => {
  const networkInfo = getNetworkInfo();
  if (!networkInfo) return false;

  return (
    networkInfo.effectiveType === 'slow-2g' ||
    networkInfo.effectiveType === '2g' ||
    networkInfo.saveData ||
    networkInfo.rtt > 400
  );
};

/**
 * パフォーマンスメトリクスの取得
 */
export const getPerformanceMetrics = () => {
  if (!window.performance) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;

  return {
    // Core Web Vitals
    FCP: navigation.responseStart - navigation.fetchStart, // First Contentful Paint
    LCP: 0, // Largest Contentful Paint (別途観測が必要)
    FID: 0, // First Input Delay (別途観測が必要)
    CLS: 0, // Cumulative Layout Shift (別途観測が必要)
    
    // その他のメトリクス
    DNS: navigation.domainLookupEnd - navigation.domainLookupStart,
    TCP: navigation.connectEnd - navigation.connectStart,
    SSL: navigation.requestStart - navigation.secureConnectionStart,
    TTFB: navigation.responseStart - navigation.requestStart,
    Download: navigation.responseEnd - navigation.responseStart,
    DOMInteractive: navigation.domInteractive - navigation.fetchStart,
    DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    Load: navigation.loadEventEnd - navigation.fetchStart,
  };
};

/**
 * メモリ使用量の取得
 */
export const getMemoryUsage = (): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};