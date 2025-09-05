/**
 * VRMアニメーション管理モジュール
 * ポーズとモーションを管理
 */

import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';

export class VRMAnimationManager {
  private vrm: VRM | null = null;
  private clock = new THREE.Clock();
  private breathingTimer = 0;
  private idleTimer = 0;
  private lookAtTarget = new THREE.Object3D();
  
  /**
   * VRMモデルをセット
   */
  setVRM(vrm: VRM | null) {
    this.vrm = vrm;
    if (vrm) {
      this.setupInitialPose();
    }
  }
  
  /**
   * 初期ポーズの設定
   */
  private setupInitialPose() {
    if (!this.vrm?.humanoid) return;
    
    const humanoid = this.vrm.humanoid;
    
    // 腕を自然に下ろす
    const leftUpperArm = humanoid.getNormalizedBoneNode('leftUpperArm');
    const rightUpperArm = humanoid.getNormalizedBoneNode('rightUpperArm');
    const leftLowerArm = humanoid.getNormalizedBoneNode('leftLowerArm');
    const rightLowerArm = humanoid.getNormalizedBoneNode('rightLowerArm');
    
    if (leftUpperArm) {
      leftUpperArm.rotation.x = 0;
      leftUpperArm.rotation.y = 0;
      leftUpperArm.rotation.z = -1.57; // 90度下に
    }
    
    if (rightUpperArm) {
      rightUpperArm.rotation.x = 0;
      rightUpperArm.rotation.y = 0;
      rightUpperArm.rotation.z = 1.57; // 90度下に
    }
    
    if (leftLowerArm) {
      leftLowerArm.rotation.x = 0;
      leftLowerArm.rotation.y = 0;
      leftLowerArm.rotation.z = 0;
    }
    
    if (rightLowerArm) {
      rightLowerArm.rotation.x = 0;
      rightLowerArm.rotation.y = 0;
      rightLowerArm.rotation.z = 0;
    }
  }
  
  /**
   * 呼吸アニメーション
   */
  private updateBreathing(deltaTime: number) {
    if (!this.vrm?.humanoid) return;
    
    this.breathingTimer += deltaTime;
    
    const chest = this.vrm.humanoid.getNormalizedBoneNode('chest');
    if (chest) {
      // 呼吸による胸の動き
      const breathAmount = Math.sin(this.breathingTimer * 0.5) * 0.02;
      chest.position.y = breathAmount;
      chest.rotation.x = breathAmount * 0.5;
    }
    
    const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
    if (spine) {
      // 背骨の微細な動き
      const spineAmount = Math.sin(this.breathingTimer * 0.5 + Math.PI * 0.5) * 0.01;
      spine.rotation.x = spineAmount;
    }
  }
  
  /**
   * アイドルモーション
   */
  private updateIdleMotion(deltaTime: number) {
    if (!this.vrm?.humanoid) return;
    
    this.idleTimer += deltaTime;
    
    // 頭の微細な動き
    const head = this.vrm.humanoid.getNormalizedBoneNode('head');
    if (head) {
      const headX = Math.sin(this.idleTimer * 0.3) * 0.02;
      const headY = Math.sin(this.idleTimer * 0.5 + Math.PI * 0.3) * 0.03;
      head.rotation.x = headX;
      head.rotation.y = headY;
    }
    
    // 体の微細な揺れ
    const hips = this.vrm.humanoid.getNormalizedBoneNode('hips');
    if (hips) {
      const swayX = Math.sin(this.idleTimer * 0.4) * 0.003;
      const swayZ = Math.sin(this.idleTimer * 0.3 + Math.PI * 0.5) * 0.003;
      hips.position.x = swayX;
      hips.position.z = swayZ;
    }
  }
  
  /**
   * 視線追従
   */
  updateLookAt(target?: THREE.Vector3) {
    if (!this.vrm?.lookAt) return;
    
    if (target) {
      this.lookAtTarget.position.copy(target);
    } else {
      // デフォルトは正面を見る
      this.lookAtTarget.position.set(0, 1.5, 2);
    }
    
    this.vrm.lookAt.target = this.lookAtTarget;
    this.vrm.lookAt.update(this.clock.getDelta());
  }
  
  /**
   * 感情による身体動作
   */
  applyEmotionPose(emotion: string, intensity: number = 50) {
    if (!this.vrm?.humanoid) return;
    
    const normalizedIntensity = intensity / 100;
    
    switch (emotion) {
      case 'happy':
        // 楽しい時は少し体を上向きに
        const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
        if (spine) {
          spine.rotation.x = -0.05 * normalizedIntensity;
        }
        break;
        
      case 'sad':
        // 悲しい時は少しうつむき加減に
        const neck = this.vrm.humanoid.getNormalizedBoneNode('neck');
        if (neck) {
          neck.rotation.x = 0.1 * normalizedIntensity;
        }
        break;
        
      case 'excited':
        // 興奮時は体の動きを大きく
        const hips = this.vrm.humanoid.getNormalizedBoneNode('hips');
        if (hips) {
          const excitement = Math.sin(this.idleTimer * 2) * 0.01 * normalizedIntensity;
          hips.position.y = excitement;
        }
        break;
    }
  }
  
  /**
   * アニメーション更新
   */
  update(deltaTime: number, emotion?: string, emotionIntensity?: number) {
    if (!this.vrm) return;
    
    // 基本アニメーション
    this.updateBreathing(deltaTime);
    this.updateIdleMotion(deltaTime);
    
    // 感情による動作
    if (emotion) {
      this.applyEmotionPose(emotion, emotionIntensity || 50);
    }
    
    // VRMの更新
    this.vrm.update(deltaTime);
  }
  
  /**
   * リソースのクリーンアップ
   */
  dispose() {
    this.vrm = null;
    this.clock.stop();
  }
}