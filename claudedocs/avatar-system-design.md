# 2Dアバターシステム設計仕様書

## 🎭 概要

AI疑似恋人アプリケーション向けの高度な2Dアバターシステム。Live2D技術を基盤とした感情表現豊かなキャラクター描画と、リアルタイム感情連動アニメーションシステム。

---

## 🏗️ アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                 Avatar System Core                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐│
│ │Live2D Engine │  │Animation     │  │Expression       ││
│ │- Model Load  │  │Controller    │  │Manager          ││
│ │- Physics     │  │- State Mgmt  │  │- Emotion Map    ││
│ │- Rendering   │  │- Transitions │  │- Facial Control││
│ └──────────────┘  └──────────────┘  └─────────────────┘│
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐│
│ │Asset Manager │  │Customization │  │Performance      ││
│ │- CDN Cache   │  │Engine        │  │Monitor          ││
│ │- Versioning  │  │- Parts Swap  │  │- FPS Tracking   ││
│ │- Compression │  │- Color Blend │  │- Memory Usage   ││
│ └──────────────┘  └──────────────┘  └─────────────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                External Integration                      │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐│
│ │Emotion Engine│  │Chat System   │  │Payment System   ││
│ │- Mood State  │  │- Message     │  │- Item Purchase  ││
│ │- Reactions   │  │- Voice Input │  │- Unlock Content ││
│ └──────────────┘  └──────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Live2D統合設計

### Core Live2D Service

```typescript
interface Live2DConfig {
  renderer: {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    resolution: {
      width: number;
      height: number;
      pixelRatio: number;
    };
    quality: 'low' | 'medium' | 'high' | 'ultra';
  };
  physics: {
    enabled: boolean;
    gravity: number;
    wind: number;
    dampening: number;
  };
  animation: {
    frameRate: number; // 60 FPS default
    interpolation: 'linear' | 'cubic' | 'smooth';
    blendTime: number; // ms for expression transitions
  };
  performance: {
    maxModels: number; // Simultaneous model limit
    cullingEnabled: boolean;
    lodEnabled: boolean; // Level of Detail
  };
}

class Live2DEngine {
  private gl: WebGL2RenderingContext;
  private renderer: Live2DRenderer;
  private modelCache: Map<string, Live2DModel> = new Map();
  private frameBuffer: WebGLFramebuffer;
  private shaderManager: ShaderManager;

  async initialize(config: Live2DConfig): Promise<void> {
    // 1. Initialize WebGL context with optimized settings
    this.gl = config.renderer.gl;
    this.setupWebGLContext();
    
    // 2. Load Live2D Framework
    await this.loadLive2DFramework();
    
    // 3. Initialize renderer with custom shaders
    this.renderer = new Live2DRenderer(this.gl);
    await this.shaderManager.loadShaders([
      'base_vertex.glsl',
      'base_fragment.glsl',
      'emotion_vertex.glsl',
      'emotion_fragment.glsl'
    ]);
    
    // 4. Set up frame buffer for post-processing
    this.frameBuffer = this.createFrameBuffer(config.renderer.resolution);
    
    // 5. Initialize physics simulation
    if (config.physics.enabled) {
      await this.initializePhysics(config.physics);
    }
  }

  async loadModel(modelPath: string, characterConfig: CharacterConfig): Promise<Live2DModel> {
    const cacheKey = `${modelPath}_${characterConfig.hash}`;
    
    // Check cache first
    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey)!;
    }

    // 1. Load model3.json and assets
    const modelData = await this.loadModelData(modelPath);
    
    // 2. Create Live2D model instance
    const model = await Live2DModel.create(modelData);
    
    // 3. Apply character customization
    await this.applyCustomization(model, characterConfig);
    
    // 4. Set up parameter mappings for emotions
    await this.setupEmotionMappings(model, characterConfig.personality);
    
    // 5. Initialize animation sequences
    await this.loadAnimations(model, modelData.animations);
    
    // 6. Cache the model
    this.modelCache.set(cacheKey, model);
    
    return model;
  }

  renderFrame(model: Live2DModel, emotionState: EmotionState): void {
    // 1. Clear frame buffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // 2. Update model parameters based on emotion
    this.updateModelParameters(model, emotionState);
    
    // 3. Update physics simulation
    if (this.physicsEnabled) {
      this.updatePhysics(model, emotionState);
    }
    
    // 4. Render model to frame buffer
    this.renderer.render(model);
    
    // 5. Apply post-processing effects
    this.applyPostProcessing(emotionState);
    
    // 6. Present to canvas
    this.presentToCanvas();
  }

  private updateModelParameters(model: Live2DModel, emotionState: EmotionState): void {
    const parameters = this.emotionToParameters(emotionState);
    
    // Update facial expressions
    model.setParameterValue('ParamEyeOpenL', parameters.eyeOpenL);
    model.setParameterValue('ParamEyeOpenR', parameters.eyeOpenR);
    model.setParameterValue('ParamMouthOpenY', parameters.mouthOpen);
    model.setParameterValue('ParamMouthForm', parameters.mouthForm);
    
    // Update body pose
    model.setParameterValue('ParamAngleX', parameters.headX);
    model.setParameterValue('ParamAngleY', parameters.headY);
    model.setParameterValue('ParamAngleZ', parameters.headZ);
    
    // Update breathing animation
    const breathingCycle = (Date.now() % 4000) / 4000; // 4 second cycle
    model.setParameterValue('ParamBreath', Math.sin(breathingCycle * Math.PI * 2) * 0.5 + 0.5);
    
    // Update model
    model.update();
  }
}
```

### Emotion-Driven Expression System

```typescript
interface ExpressionMapping {
  emotionRange: {
    min: number;
    max: number;
  };
  parameters: {
    [paramName: string]: {
      value: number;
      weight: number;
    };
  };
  animations: string[];
  transitionTime: number;
}

class ExpressionManager {
  private expressionMappings: Map<string, ExpressionMapping> = new Map();
  private currentExpression: string = 'neutral';
  private transitionQueue: ExpressionTransition[] = [];

  constructor(private live2dEngine: Live2DEngine) {}

  async initializeExpressions(characterPersonality: CharacterPersonality): Promise<void> {
    // 1. Load base expression mappings
    const baseExpressions = await this.loadBaseExpressions();
    
    // 2. Customize based on personality
    const customizedExpressions = this.customizeExpressions(baseExpressions, characterPersonality);
    
    // 3. Store mappings
    customizedExpressions.forEach((mapping, name) => {
      this.expressionMappings.set(name, mapping);
    });
  }

  async updateExpression(emotionState: EmotionState): Promise<void> {
    // 1. Determine target expression based on emotion
    const targetExpression = this.determineExpression(emotionState);
    
    // 2. Skip if already in target expression
    if (targetExpression === this.currentExpression) {
      this.adjustExpressionIntensity(emotionState);
      return;
    }
    
    // 3. Create transition
    const transition: ExpressionTransition = {
      from: this.currentExpression,
      to: targetExpression,
      startTime: Date.now(),
      duration: this.getTransitionDuration(this.currentExpression, targetExpression),
      easing: this.getEasingFunction(targetExpression)
    };
    
    // 4. Add to queue
    this.transitionQueue.push(transition);
    
    // 5. Update current expression
    this.currentExpression = targetExpression;
  }

  private determineExpression(emotionState: EmotionState): string {
    const { currentMood, factors } = emotionState;
    
    // Mood-based expression selection
    if (currentMood > 80) return 'joyful';
    if (currentMood > 60) return 'happy';
    if (currentMood > 40) return 'pleased';
    if (currentMood > 20) return 'neutral';
    if (currentMood > 0) return 'thoughtful';
    if (currentMood > -20) return 'concerned';
    if (currentMood > -40) return 'sad';
    if (currentMood > -60) return 'distressed';
    return 'upset';
  }

  private customizeExpressions(
    baseExpressions: Map<string, ExpressionMapping>,
    personality: CharacterPersonality
  ): Map<string, ExpressionMapping> {
    const customized = new Map<string, ExpressionMapping>();
    
    baseExpressions.forEach((mapping, name) => {
      const customMapping = { ...mapping };
      
      // Adjust based on personality traits
      if (name === 'happy' && personality.humor > 70) {
        // More expressive happy face for humorous characters
        customMapping.parameters['ParamMouthForm'].value *= 1.2;
        customMapping.parameters['ParamEyeOpenL'].value *= 1.1;
        customMapping.parameters['ParamEyeOpenR'].value *= 1.1;
      }
      
      if (name === 'sad' && personality.empathy > 70) {
        // More subtle sad expression for empathetic characters
        customMapping.parameters['ParamMouthForm'].value *= 0.8;
        customMapping.transitionTime *= 1.3;
      }
      
      customized.set(name, customMapping);
    });
    
    return customized;
  }
}
```

### Avatar Customization Engine

```typescript
interface CustomizationPart {
  id: string;
  name: string;
  category: 'hair' | 'eyes' | 'outfit' | 'accessory';
  meshId: string;
  textureId: string;
  parameters: Record<string, number>;
  unlockConditions?: {
    level?: number;
    purchaseRequired?: boolean;
    itemId?: string;
  };
}

interface ColorVariation {
  id: string;
  name: string;
  colors: {
    primary: string;   // #RRGGBB
    secondary: string; // #RRGGBB
    accent?: string;   // #RRGGBB
  };
  shaderParams: Record<string, number>;
}

class CustomizationEngine {
  private availableParts: Map<string, CustomizationPart[]> = new Map();
  private colorVariations: Map<string, ColorVariation[]> = new Map();
  private shaderManager: ShaderManager;

  async initializeCustomization(gender: 'boyfriend' | 'girlfriend'): Promise<void> {
    // 1. Load base parts for gender
    const baseParts = await this.loadBaseParts(gender);
    
    // 2. Load premium/unlockable parts
    const premiumParts = await this.loadPremiumParts(gender);
    
    // 3. Organize by category
    ['hair', 'eyes', 'outfit', 'accessory'].forEach(category => {
      this.availableParts.set(category, [
        ...baseParts.filter(p => p.category === category),
        ...premiumParts.filter(p => p.category === category)
      ]);
    });
    
    // 4. Load color variations
    await this.loadColorVariations();
    
    // 5. Initialize custom shaders for recoloring
    await this.setupCustomShaders();
  }

  async applyCustomization(
    model: Live2DModel, 
    customization: AvatarCustomization
  ): Promise<void> {
    // 1. Apply hair customization
    if (customization.hairStyle) {
      await this.applyHairCustomization(model, customization.hairStyle, customization.hairColor);
    }
    
    // 2. Apply eye customization
    if (customization.eyeStyle) {
      await this.applyEyeCustomization(model, customization.eyeStyle, customization.eyeColor);
    }
    
    // 3. Apply outfit customization
    if (customization.outfit) {
      await this.applyOutfitCustomization(model, customization.outfit);
    }
    
    // 4. Apply accessories
    if (customization.accessories?.length > 0) {
      await this.applyAccessories(model, customization.accessories);
    }
    
    // 5. Update model textures and meshes
    await model.updateCustomization();
  }

  private async applyHairCustomization(
    model: Live2DModel, 
    hairStyleId: string, 
    colorId?: string
  ): Promise<void> {
    const hairPart = this.getPartById('hair', hairStyleId);
    if (!hairPart) return;

    // 1. Replace hair mesh
    await model.replaceMesh(hairPart.meshId);
    
    // 2. Apply base texture
    await model.replaceTexture('hair', hairPart.textureId);
    
    // 3. Apply color variation if specified
    if (colorId) {
      const colorVariation = this.getColorVariation('hair', colorId);
      if (colorVariation) {
        await this.applyColorShader(model, 'hair', colorVariation);
      }
    }
    
    // 4. Update Live2D parameters for hair physics
    Object.entries(hairPart.parameters).forEach(([param, value]) => {
      model.setParameterValue(param, value);
    });
  }

  private async applyColorShader(
    model: Live2DModel, 
    partCategory: string, 
    colorVariation: ColorVariation
  ): Promise<void> {
    const shader = this.shaderManager.getShader('color_variation');
    
    // Set shader uniforms for color transformation
    shader.setUniform('u_primaryColor', this.hexToRGB(colorVariation.colors.primary));
    shader.setUniform('u_secondaryColor', this.hexToRGB(colorVariation.colors.secondary));
    
    if (colorVariation.colors.accent) {
      shader.setUniform('u_accentColor', this.hexToRGB(colorVariation.colors.accent));
    }
    
    // Apply shader-specific parameters
    Object.entries(colorVariation.shaderParams).forEach(([param, value]) => {
      shader.setUniform(param, value);
    });
    
    // Apply shader to model part
    model.applyShaderToPart(partCategory, shader);
  }
}
```

### Performance Optimization System

```typescript
interface PerformanceConfig {
  qualityLevels: {
    [level: string]: QualitySettings;
  };
  adaptiveQuality: {
    enabled: boolean;
    targetFPS: number;
    minFPS: number;
    adjustmentInterval: number; // ms
  };
  memoryManagement: {
    maxCacheSize: number; // MB
    textureCompression: boolean;
    modelLOD: boolean;
  };
}

interface QualitySettings {
  resolution: {
    scale: number; // 0.5 - 2.0
    maxWidth: number;
    maxHeight: number;
  };
  animation: {
    frameRate: number;
    interpolationQuality: 'low' | 'medium' | 'high';
    physicsEnabled: boolean;
  };
  rendering: {
    antialiasingLevel: number; // 0, 2, 4, 8
    shadowQuality: 'off' | 'low' | 'medium' | 'high';
    postProcessing: boolean;
  };
}

class PerformanceMonitor {
  private fpsHistory: number[] = [];
  private memoryUsage: number[] = [];
  private currentQuality: string = 'medium';
  private lastAdjustment: number = 0;

  constructor(
    private live2dEngine: Live2DEngine,
    private config: PerformanceConfig
  ) {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // FPS monitoring
    let lastTime = performance.now();
    let frameCount = 0;

    const fpsLoop = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.recordFPS(fps);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(fpsLoop);
    };
    
    requestAnimationFrame(fpsLoop);

    // Memory monitoring
    setInterval(() => {
      this.recordMemoryUsage();
    }, 5000);

    // Adaptive quality adjustment
    if (this.config.adaptiveQuality.enabled) {
      setInterval(() => {
        this.adjustQualityIfNeeded();
      }, this.config.adaptiveQuality.adjustmentInterval);
    }
  }

  private recordFPS(fps: number): void {
    this.fpsHistory.push(fps);
    
    // Keep only last 10 seconds of data
    if (this.fpsHistory.length > 10) {
      this.fpsHistory.shift();
    }
  }

  private recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usageInMB = memInfo.usedJSHeapSize / (1024 * 1024);
      this.memoryUsage.push(usageInMB);
      
      // Keep only last 5 minutes of data
      if (this.memoryUsage.length > 60) {
        this.memoryUsage.shift();
      }
    }
  }

  private adjustQualityIfNeeded(): void {
    const now = Date.now();
    const timeSinceLastAdjustment = now - this.lastAdjustment;
    
    // Avoid too frequent adjustments
    if (timeSinceLastAdjustment < 5000) return;

    const avgFPS = this.getAverageFPS();
    const targetFPS = this.config.adaptiveQuality.targetFPS;
    const minFPS = this.config.adaptiveQuality.minFPS;

    if (avgFPS < minFPS) {
      // Performance is too low, decrease quality
      this.decreaseQuality();
    } else if (avgFPS > targetFPS * 1.2) {
      // Performance is good, try increasing quality
      this.increaseQuality();
    }

    this.lastAdjustment = now;
  }

  private decreaseQuality(): void {
    const qualityLevels = Object.keys(this.config.qualityLevels);
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    if (currentIndex > 0) {
      const newQuality = qualityLevels[currentIndex - 1];
      this.applyQualitySettings(newQuality);
      console.log(`Quality decreased to: ${newQuality}`);
    }
  }

  private increaseQuality(): void {
    const qualityLevels = Object.keys(this.config.qualityLevels);
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    if (currentIndex < qualityLevels.length - 1) {
      const newQuality = qualityLevels[currentIndex + 1];
      this.applyQualitySettings(newQuality);
      console.log(`Quality increased to: ${newQuality}`);
    }
  }

  private applyQualitySettings(qualityLevel: string): void {
    const settings = this.config.qualityLevels[qualityLevel];
    if (!settings) return;

    // Update Live2D engine settings
    this.live2dEngine.updateQuality({
      resolution: settings.resolution,
      animation: settings.animation,
      rendering: settings.rendering
    });

    this.currentQuality = qualityLevel;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return {
      currentFPS: this.fpsHistory[this.fpsHistory.length - 1] || 0,
      averageFPS: this.getAverageFPS(),
      memoryUsage: this.memoryUsage[this.memoryUsage.length - 1] || 0,
      currentQuality: this.currentQuality,
      qualityAdjustments: this.lastAdjustment > 0 ? 'active' : 'inactive'
    };
  }

  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }
}
```

### Asset Management System

```typescript
interface AssetConfig {
  cdn: {
    baseUrl: string;
    cacheControl: string;
    compression: boolean;
  };
  local: {
    cacheSize: number; // MB
    preloadAssets: string[];
  };
  quality: {
    textureFormats: string[]; // ['webp', 'jpg', 'png']
    compressionLevel: number;
  };
}

class AssetManager {
  private assetCache: Map<string, any> = new Map();
  private downloadQueue: Set<string> = new Set();
  private preloadedAssets: Set<string> = new Set();

  constructor(private config: AssetConfig) {
    this.initializeCache();
  }

  async loadModelAssets(modelId: string): Promise<ModelAssets> {
    const cacheKey = `model_${modelId}`;
    
    // Check cache first
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey);
    }

    // Load model manifest
    const manifest = await this.loadManifest(modelId);
    
    // Determine optimal format based on browser support
    const optimalFormat = this.getOptimalFormat();
    
    // Load assets concurrently
    const assets = await Promise.all([
      this.loadModelData(`${modelId}/model3.json`),
      this.loadTextures(manifest.textures, optimalFormat),
      this.loadPhysicsData(`${modelId}/physics3.json`),
      this.loadAnimations(manifest.animations)
    ]);

    const modelAssets: ModelAssets = {
      modelData: assets[0],
      textures: assets[1],
      physics: assets[2],
      animations: assets[3]
    };

    // Cache for future use
    this.cacheAsset(cacheKey, modelAssets);
    
    return modelAssets;
  }

  async preloadAssets(assetIds: string[]): Promise<void> {
    const downloadPromises = assetIds
      .filter(id => !this.preloadedAssets.has(id))
      .map(async id => {
        try {
          await this.loadAsset(id);
          this.preloadedAssets.add(id);
        } catch (error) {
          console.warn(`Failed to preload asset: ${id}`, error);
        }
      });

    await Promise.allSettled(downloadPromises);
  }

  private async loadTextures(textureIds: string[], format: string): Promise<WebGLTexture[]> {
    const textures = await Promise.all(
      textureIds.map(async id => {
        const textureUrl = `${this.config.cdn.baseUrl}/textures/${id}.${format}`;
        const imageData = await this.loadImage(textureUrl);
        return this.createWebGLTexture(imageData);
      })
    );

    return textures;
  }

  private createWebGLTexture(imageData: ImageData | HTMLImageElement): WebGLTexture {
    const gl = this.getWebGLContext();
    const texture = gl.createTexture();
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    
    // Generate mipmaps for better scaling
    gl.generateMipmap(gl.TEXTURE_2D);
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    return texture!;
  }

  private getOptimalFormat(): string {
    // Check browser support for modern formats
    if (this.supportsWebP()) return 'webp';
    if (this.supportsAVIF()) return 'avif';
    return 'png';
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  }

  private cacheAsset(key: string, asset: any): void {
    // Check cache size limit
    if (this.getCurrentCacheSize() > this.config.local.cacheSize * 1024 * 1024) {
      this.evictOldestAssets();
    }

    this.assetCache.set(key, asset);
  }

  private evictOldestAssets(): void {
    // Simple LRU eviction - remove oldest 25% of cache
    const entries = Array.from(this.assetCache.entries());
    const evictCount = Math.floor(entries.length * 0.25);
    
    for (let i = 0; i < evictCount; i++) {
      this.assetCache.delete(entries[i][0]);
    }
  }

  async clearCache(): Promise<void> {
    this.assetCache.clear();
    this.preloadedAssets.clear();
    
    // Clear IndexedDB cache if used
    if ('caches' in window) {
      await caches.delete('avatar-assets');
    }
  }
}
```

---

## 📊 パフォーマンス指標

### Target Performance Metrics

```typescript
interface PerformanceTargets {
  rendering: {
    fps: {
      target: 60;
      minimum: 30;
      mobile: 30;
    };
    frameTime: {
      target: 16.67; // ms for 60fps
      maximum: 33.33; // ms for 30fps
    };
    memory: {
      textureMemory: 256; // MB max
      modelMemory: 128; // MB max
      totalMemory: 512; // MB max
    };
  };
  loading: {
    initialLoad: 3000; // ms
    assetLoad: 1000; // ms per asset
    cacheHit: 100; // ms
  };
  customization: {
    partSwap: 500; // ms
    colorChange: 200; // ms
    fullCustomization: 2000; // ms
  };
}

// Benchmark suite
class AvatarPerformanceBenchmark {
  async runBenchmark(): Promise<BenchmarkResults> {
    const results: BenchmarkResults = {
      rendering: await this.benchmarkRendering(),
      memory: await this.benchmarkMemory(),
      loading: await this.benchmarkLoading(),
      customization: await this.benchmarkCustomization()
    };

    return results;
  }

  private async benchmarkRendering(): Promise<RenderingBenchmark> {
    const frames: number[] = [];
    const startTime = performance.now();
    let frameCount = 0;

    return new Promise(resolve => {
      const renderLoop = (currentTime: number) => {
        frames.push(currentTime);
        frameCount++;

        if (currentTime - startTime > 10000) { // 10 second test
          const totalTime = currentTime - startTime;
          const avgFps = (frameCount / totalTime) * 1000;
          const minFrameTime = Math.min(...frames);
          const maxFrameTime = Math.max(...frames);
          const avgFrameTime = totalTime / frameCount;

          resolve({
            averageFPS: avgFps,
            minFrameTime,
            maxFrameTime,
            averageFrameTime: avgFrameTime,
            droppedFrames: frames.filter(f => f > 33.33).length
          });
        } else {
          requestAnimationFrame(renderLoop);
        }
      };

      requestAnimationFrame(renderLoop);
    });
  }
}
```

---

## 🔧 開発・デプロイメント指針

### Development Workflow

```typescript
// Asset pipeline for Live2D models
interface AssetPipeline {
  source: {
    // Raw Cubism Editor exports
    modelFiles: string[]; // .cmo3, .can3
    textureFiles: string[]; // .psd, .png
    animationFiles: string[]; // .can3
  };
  
  processing: {
    // Optimization steps
    textureOptimization: {
      compression: 'webp' | 'basis' | 'astc';
      quality: number; // 0-100
      mipmaps: boolean;
    };
    
    modelOptimization: {
      polygonReduction: number; // 0-1
      parameterPruning: boolean;
      physicsSimplification: boolean;
    };
    
    animationOptimization: {
      keyframeReduction: boolean;
      curveSimplification: number;
    };
  };
  
  output: {
    // Production-ready assets
    webOptimizedModel: string; // .model3.json
    compressedTextures: string[]; // .webp/.basis
    optimizedAnimations: string[]; // .motion3.json
    manifestFile: string; // asset-manifest.json
  };
}

// Build configuration
const buildConfig: BuildConfig = {
  target: ['web', 'mobile'],
  optimization: {
    level: 'production',
    treeShaking: true,
    codeMinification: true,
    assetOptimization: true
  },
  output: {
    format: 'es6',
    chunking: 'automatic',
    compression: 'gzip'
  }
};
```

### Quality Assurance

```typescript
interface QATestSuite {
  visual: {
    // Visual regression testing
    expressionAccuracy: TestCase[];
    animationSmoothness: TestCase[];
    customizationAccuracy: TestCase[];
  };
  
  performance: {
    // Performance testing
    fpsConsistency: PerformanceTest[];
    memoryLeaks: MemoryTest[];
    loadingTimes: LoadingTest[];
  };
  
  compatibility: {
    // Browser/device compatibility
    browsers: BrowserTest[];
    devices: DeviceTest[];
    resolutions: ResolutionTest[];
  };
  
  accessibility: {
    // Accessibility compliance
    colorContrast: AccessibilityTest[];
    keyboardNavigation: AccessibilityTest[];
    screenReader: AccessibilityTest[];
  };
}
```

---

このアバターシステム設計により、高品質で表現豊かな2Dキャラクターアニメーションと、ユーザーの感情状態に連動したリアルタイム表情変化を実現できます。パフォーマンス最適化により、幅広いデバイスでスムーズな動作を保証します。