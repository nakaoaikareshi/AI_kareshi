/**
 * VRM表情管理モジュール
 * 感情表現と表情アニメーションを管理
 */

import { VRM } from '@pixiv/three-vrm';
import { EmotionType } from '@/utils/emotionAnalyzer';

export class VRMExpressionManager {
  private vrm: VRM | null = null;
  private currentEmotion: EmotionType = 'normal';
  private currentIntensity: number = 50;
  private blinkTimer: number = 0;
  private speakTimer: number = 0;
  
  /**
   * VRMモデルをセット
   */
  setVRM(vrm: VRM | null) {
    this.vrm = vrm;
  }
  
  /**
   * 全ての表情をリセット
   */
  private resetExpressions() {
    if (!this.vrm?.expressionManager) return;
    
    const expressions = [
      'neutral', 'happy', 'sad', 'angry', 'surprised', 
      'relaxed', 'blink', 'blinkLeft', 'blinkRight'
    ];
    
    expressions.forEach(exp => {
      this.vrm!.expressionManager?.setValue(exp, 0);
    });
  }
  
  /**
   * 感情に応じた表情を適用
   */
  applyEmotion(emotion: EmotionType, intensity: number = 50) {
    if (!this.vrm?.expressionManager) return;
    
    this.currentEmotion = emotion;
    this.currentIntensity = intensity;
    
    // リセット
    this.resetExpressions();
    
    // 感情の強度を0-1に正規化
    const normalizedIntensity = Math.min(1, intensity / 100);
    
    // 感情に応じた表情を設定
    switch (emotion) {
      case 'happy':
        this.vrm!.expressionManager!.setValue('happy', normalizedIntensity);
        if (normalizedIntensity < 1) {
          this.vrm!.expressionManager!.setValue('neutral', 1 - normalizedIntensity);
        }
        break;
        
      case 'sad':
        this.vrm!.expressionManager!.setValue('sad', normalizedIntensity);
        if (normalizedIntensity < 1) {
          this.vrm!.expressionManager!.setValue('neutral', 1 - normalizedIntensity);
        }
        break;
        
      case 'angry':
        this.vrm!.expressionManager!.setValue('angry', normalizedIntensity);
        if (normalizedIntensity < 1) {
          this.vrm!.expressionManager!.setValue('neutral', 1 - normalizedIntensity);
        }
        break;
        
      case 'surprised':
        this.vrm!.expressionManager!.setValue('surprised', normalizedIntensity);
        if (normalizedIntensity < 1) {
          this.vrm!.expressionManager!.setValue('neutral', 1 - normalizedIntensity);
        }
        break;
        
      case 'love':
        this.vrm!.expressionManager!.setValue('happy', normalizedIntensity * 0.7);
        this.vrm!.expressionManager!.setValue('relaxed', normalizedIntensity * 0.3);
        if (normalizedIntensity < 1) {
          this.vrm!.expressionManager!.setValue('neutral', 1 - normalizedIntensity);
        }
        break;
        
      case 'shy':
        this.vrm!.expressionManager!.setValue('happy', normalizedIntensity * 0.3);
        this.vrm!.expressionManager!.setValue('relaxed', normalizedIntensity * 0.2);
        if (normalizedIntensity < 1) {
          this.vrm!.expressionManager!.setValue('neutral', 1 - normalizedIntensity);
        }
        break;
        
      case 'excited':
        this.vrm!.expressionManager!.setValue('happy', normalizedIntensity * 0.8);
        this.vrm!.expressionManager!.setValue('surprised', normalizedIntensity * 0.2);
        break;
        
      case 'worried':
        this.vrm!.expressionManager!.setValue('sad', normalizedIntensity * 0.4);
        this.vrm!.expressionManager!.setValue('surprised', normalizedIntensity * 0.2);
        if (normalizedIntensity < 1) {
          this.vrm!.expressionManager!.setValue('neutral', 1 - normalizedIntensity);
        }
        break;
        
      case 'normal':
      default:
        this.vrm!.expressionManager!.setValue('neutral', 1);
        break;
    }
    
    this.vrm!.expressionManager!.update();
  }
  
  /**
   * 瞬きアニメーション
   */
  updateBlink(deltaTime: number) {
    if (!this.vrm?.expressionManager) return;
    
    this.blinkTimer += deltaTime;
    
    // 3-5秒ごとに瞬き
    const blinkInterval = 3 + Math.random() * 2;
    
    if (this.blinkTimer > blinkInterval) {
      this.blinkTimer = 0;
      
      // 瞬きアニメーション
      const blinkDuration = 0.15;
      this.vrm!.expressionManager!.setValue('blink', 1);
      
      setTimeout(() => {
        if (this.vrm?.expressionManager) {
          this.vrm!.expressionManager!.setValue('blink', 0);
          // 感情表情を復元
          this.applyEmotion(this.currentEmotion, this.currentIntensity);
        }
      }, blinkDuration * 1000);
    }
  }
  
  /**
   * 発話アニメーション
   */
  updateSpeaking(deltaTime: number, isSpeaking: boolean) {
    if (!this.vrm?.expressionManager) return;
    
    if (isSpeaking) {
      this.speakTimer += deltaTime * 10;
      const mouthOpen = Math.abs(Math.sin(this.speakTimer)) * 0.5;
      this.vrm!.expressionManager!.setValue('aa', mouthOpen);
    } else {
      this.speakTimer = 0;
      this.vrm!.expressionManager!.setValue('aa', 0);
    }
  }
  
  /**
   * 表情を更新
   */
  update(deltaTime: number, isSpeaking: boolean = false, isBlinking: boolean = true) {
    if (!this.vrm) return;
    
    // 瞬き更新
    if (isBlinking) {
      this.updateBlink(deltaTime);
    }
    
    // 発話更新
    this.updateSpeaking(deltaTime, isSpeaking);
    
    // VRMの表情を更新
    this.vrm.expressionManager?.update();
  }
  
  /**
   * リソースのクリーンアップ
   */
  dispose() {
    this.vrm = null;
    this.blinkTimer = 0;
    this.speakTimer = 0;
  }
}