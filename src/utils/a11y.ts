/**
 * アクセシビリティユーティリティ関数
 */

/**
 * ARIA属性を条件付きで生成
 */
export const ariaProps = (
  conditions: Record<string, boolean | string | number | undefined>
): Record<string, string | boolean | undefined> => {
  const result: Record<string, string | boolean | undefined> = {};
  
  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== false) {
      result[`aria-${key}`] = value === true ? 'true' : value as string;
    }
  });
  
  return result;
};

/**
 * フォーカス可能な要素かどうかを判定
 */
export const isFocusable = (element: HTMLElement): boolean => {
  if (element.tabIndex > 0) return true;
  if (element.tabIndex < 0) return false;
  
  const focusableTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
  if (focusableTags.includes(element.tagName)) {
    return !(element as any).disabled;
  }
  
  return element.tabIndex === 0;
};

/**
 * コンテナ内のフォーカス可能な要素を取得
 */
export const getFocusableElements = (
  container: HTMLElement
): HTMLElement[] => {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
};

/**
 * キーボードイベントが修飾キーを含むかチェック
 */
export const hasModifierKey = (event: KeyboardEvent): boolean => {
  return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
};

/**
 * 色のコントラスト比を計算（WCAG準拠）
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // HEXカラーをRGBに変換
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // 相対輝度を計算
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * WCAG AAレベルのコントラスト比要件を満たすかチェック
 */
export const meetsContrastRequirement = (
  ratio: number,
  fontSize: number,
  isBold: boolean = false
): boolean => {
  // 大きいテキスト（18pt以上、または14pt以上の太字）
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
  
  // AA基準: 通常テキスト4.5:1、大きいテキスト3:1
  const requiredRatio = isLargeText ? 3 : 4.5;
  
  return ratio >= requiredRatio;
};

/**
 * スクリーンリーダー用のテキストを生成
 */
export const getScreenReaderText = (
  text: string,
  options?: {
    abbreviations?: Record<string, string>;
    numbers?: boolean;
  }
): string => {
  let result = text;
  
  // 略語の展開
  if (options?.abbreviations) {
    Object.entries(options.abbreviations).forEach(([abbr, full]) => {
      result = result.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
    });
  }
  
  // 数字の読み上げ改善
  if (options?.numbers) {
    result = result.replace(/(\d+)([kK])/, '$1,000');
    result = result.replace(/(\d+)([mM])/, '$1,000,000');
  }
  
  return result;
};

/**
 * ランドマークロールの適切な使用をチェック
 */
export const validateLandmarks = (container: HTMLElement): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const landmarks = container.querySelectorAll('[role]');
  const mainElements = container.querySelectorAll('[role="main"]');
  
  // mainロールは1つだけ
  if (mainElements.length > 1) {
    errors.push('複数のmainロールが検出されました');
  }
  
  // 重複するランドマークには一意のラベルが必要
  const landmarkTypes = new Map<string, Element[]>();
  landmarks.forEach(landmark => {
    const role = landmark.getAttribute('role');
    if (role) {
      if (!landmarkTypes.has(role)) {
        landmarkTypes.set(role, []);
      }
      landmarkTypes.get(role)?.push(landmark);
    }
  });
  
  landmarkTypes.forEach((elements, role) => {
    if (elements.length > 1) {
      elements.forEach(element => {
        if (!element.getAttribute('aria-label') && 
            !element.getAttribute('aria-labelledby')) {
          errors.push(`複数の${role}ロールには一意のラベルが必要です`);
        }
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 適切な見出し構造をチェック
 */
export const validateHeadingStructure = (container: HTMLElement): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  
  if (headings.length === 0) {
    errors.push('見出しが見つかりません');
    return { valid: false, errors };
  }
  
  // h1は1つだけ
  const h1Elements = headings.filter(h => h.tagName === 'H1');
  if (h1Elements.length === 0) {
    errors.push('h1見出しが見つかりません');
  } else if (h1Elements.length > 1) {
    errors.push('h1見出しが複数存在します');
  }
  
  // 見出しレベルのスキップをチェック
  let previousLevel = 0;
  headings.forEach(heading => {
    const currentLevel = parseInt(heading.tagName.substring(1));
    if (previousLevel > 0 && currentLevel > previousLevel + 1) {
      errors.push(`見出しレベルがスキップされています: h${previousLevel} → h${currentLevel}`);
    }
    previousLevel = currentLevel;
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};