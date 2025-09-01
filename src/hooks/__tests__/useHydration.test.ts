import { renderHook, act } from '@testing-library/react';
import { useHydration } from '../useHydration';

describe('useHydration', () => {
  test('フックが正しく動作する', async () => {
    const { result } = renderHook(() => useHydration());
    
    // 初期状態またはhydration後の状態をチェック
    expect(typeof result.current).toBe('boolean');
    
    // useEffect が実行されるのを待つ
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // hydration後はtrueになるはず
    expect(result.current).toBe(true);
  });
});