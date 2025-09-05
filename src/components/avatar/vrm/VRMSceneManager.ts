/**
 * VRMシーン管理モジュール
 * Three.jsのシーン、カメラ、レンダラーを管理
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneConfig {
  width: number;
  height: number;
  background?: {
    type: 'color' | 'image' | 'gradient';
    value?: string;
  };
}

export class VRMSceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls | null = null;
  private animationId: number | null = null;
  
  constructor(container: HTMLDivElement, config: SceneConfig) {
    // シーン作成
    this.scene = new THREE.Scene();
    
    // カメラ設定
    this.camera = new THREE.PerspectiveCamera(
      35,
      config.width / config.height,
      0.1,
      1000
    );
    
    // カメラ位置を調整（全身が見えるように）
    this.camera.position.set(0, 1.0, 2.5);
    this.camera.lookAt(0, 0.75, 0);
    
    // レンダラー設定
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(config.width, config.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // コンテナに追加
    container.appendChild(this.renderer.domElement);
    
    // 背景設定
    this.setupBackground(config.background);
    
    // ライティング設定
    this.setupLighting();
    
    // オプション: OrbitControlsの設定（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      this.setupControls();
    }
  }
  
  /**
   * 背景の設定
   */
  private setupBackground(background?: SceneConfig['background']) {
    if (!background) {
      // デフォルト背景
      this.scene.background = new THREE.Color(0xf0f0f0);
      return;
    }
    
    switch (background.type) {
      case 'color':
        this.scene.background = new THREE.Color(background.value || 0xf0f0f0);
        break;
        
      case 'gradient':
        // グラデーション背景の実装
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
          const gradient = context.createLinearGradient(0, 0, 0, 512);
          gradient.addColorStop(0, '#e6f3ff');
          gradient.addColorStop(1, '#fff5e6');
          context.fillStyle = gradient;
          context.fillRect(0, 0, 2, 512);
          
          const texture = new THREE.CanvasTexture(canvas);
          this.scene.background = texture;
        }
        break;
        
      case 'image':
        if (background.value) {
          const loader = new THREE.TextureLoader();
          loader.load(background.value, (texture) => {
            this.scene.background = texture;
          });
        }
        break;
    }
  }
  
  /**
   * ライティングの設定
   */
  private setupLighting() {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // メインライト（キーライト）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);
    
    // フィルライト
    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);
    
    // リムライト（輪郭を強調）
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 3, -8);
    this.scene.add(rimLight);
    
    // 地面からの反射光
    const groundLight = new THREE.DirectionalLight(0xffd4a3, 0.2);
    groundLight.position.set(0, -5, 0);
    this.scene.add(groundLight);
  }
  
  /**
   * コントロールの設定（開発用）
   */
  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.target.set(0, 0.75, 0);
    this.controls.update();
  }
  
  /**
   * シーンにオブジェクトを追加
   */
  addToScene(object: THREE.Object3D) {
    this.scene.add(object);
  }
  
  /**
   * シーンからオブジェクトを削除
   */
  removeFromScene(object: THREE.Object3D) {
    this.scene.remove(object);
  }
  
  /**
   * レンダリング
   */
  render() {
    if (this.controls) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * リサイズ対応
   */
  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * 背景更新
   */
  updateBackground(background: SceneConfig['background']) {
    this.setupBackground(background);
  }
  
  /**
   * カメラ位置の更新
   */
  updateCameraPosition(position: THREE.Vector3, lookAt?: THREE.Vector3) {
    this.camera.position.copy(position);
    if (lookAt) {
      this.camera.lookAt(lookAt);
    }
  }
  
  /**
   * リソースのクリーンアップ
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    this.renderer.dispose();
    
    // シーン内のオブジェクトをクリーンアップ
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    
    this.scene.clear();
  }
  
  /**
   * Getters
   */
  getScene() {
    return this.scene;
  }
  
  getCamera() {
    return this.camera;
  }
  
  getRenderer() {
    return this.renderer;
  }
}