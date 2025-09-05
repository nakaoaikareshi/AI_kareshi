/**
 * VRMローダーモジュール
 * VRMモデルの読み込みとキャッシュ管理
 */

import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// VRMモデルのキャッシュ
const vrmCache = new Map<string, VRM>();

export class VRMLoader {
  private loader: GLTFLoader;
  private loadingPromises = new Map<string, Promise<VRM>>();
  
  constructor() {
    this.loader = new GLTFLoader();
    this.loader.register((parser) => new VRMLoaderPlugin(parser));
  }
  
  /**
   * VRMモデルを読み込み（キャッシュ対応）
   */
  async loadVRM(url: string): Promise<VRM> {
    // キャッシュチェック
    if (vrmCache.has(url)) {
      return vrmCache.get(url)!;
    }
    
    // 既に読み込み中の場合は同じPromiseを返す
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }
    
    // 新規読み込み
    const loadPromise = this.loadVRMInternal(url);
    this.loadingPromises.set(url, loadPromise);
    
    try {
      const vrm = await loadPromise;
      vrmCache.set(url, vrm);
      this.loadingPromises.delete(url);
      return vrm;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }
  
  /**
   * 実際のVRM読み込み処理
   */
  private async loadVRMInternal(url: string): Promise<VRM> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const vrm = gltf.userData.vrm as VRM;
          if (!vrm) {
            reject(new Error('VRMモデルの読み込みに失敗しました'));
            return;
          }
          
          // VRMモデルの最適化
          this.optimizeVRM(vrm);
          
          resolve(vrm);
        },
        (progress) => {
          // プログレスイベント
          const percent = (progress.loaded / progress.total) * 100;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('vrm-load-progress', {
                detail: { url, percent }
              })
            );
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
  
  /**
   * VRMモデルの最適化
   */
  private optimizeVRM(vrm: VRM) {
    // シャドウの設定
    vrm.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        
        // マテリアルの最適化
        if (obj.material instanceof THREE.Material) {
          obj.material.needsUpdate = false;
        }
        
        // ジオメトリの最適化
        if (obj.geometry) {
          obj.geometry.computeBoundingBox();
          obj.geometry.computeBoundingSphere();
        }
      }
    });
    
    // VRMUtilsによる最適化
    VRMUtils.deepDispose(vrm.scene);
    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    VRMUtils.removeUnnecessaryJoints(vrm.scene);
    
    // 回転補正（VRMは180度回転が必要）
    vrm.scene.rotation.y = Math.PI;
    
    // スケール調整
    const scale = 1.0;
    vrm.scene.scale.set(scale, scale, scale);
  }
  
  /**
   * デフォルトVRMの読み込み（ローカルファイル用）
   */
  async loadDefaultVRM(): Promise<VRM> {
    // デフォルトのVRMモデルURLを設定
    const defaultUrl = '/models/default-avatar.vrm';
    
    try {
      return await this.loadVRM(defaultUrl);
    } catch (error) {
      // フォールバック: シンプルなアバターを生成
      return this.createFallbackVRM();
    }
  }
  
  /**
   * フォールバックVRMの生成
   */
  private createFallbackVRM(): VRM {
    // シンプルな3Dモデルを作成
    const scene = new THREE.Scene();
    
    // ボディ
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.5,
      metalness: 0.0,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    scene.add(body);
    
    // ヘッド
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd4a3,
      roughness: 0.5,
      metalness: 0.0,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.2;
    scene.add(head);
    
    // VRMダミーオブジェクトを返す（実際にはVRMではない）
    return {
      scene,
      humanoid: null,
      expressionManager: null,
      lookAt: null,
      update: () => {},
    } as unknown as VRM;
  }
  
  /**
   * キャッシュのクリア
   */
  clearCache(url?: string) {
    if (url) {
      const vrm = vrmCache.get(url);
      if (vrm) {
        VRMUtils.deepDispose(vrm.scene);
        vrmCache.delete(url);
      }
    } else {
      // 全てクリア
      vrmCache.forEach((vrm) => {
        VRMUtils.deepDispose(vrm.scene);
      });
      vrmCache.clear();
    }
  }
  
  /**
   * キャッシュサイズの取得
   */
  getCacheSize(): number {
    return vrmCache.size;
  }
}

// シングルトンインスタンス
export const vrmLoader = new VRMLoader();