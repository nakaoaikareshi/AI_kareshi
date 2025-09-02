interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export class SpeechRecognitionManager {
  private static instance: SpeechRecognitionManager;
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;

  private constructor() {
    this.isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    
    if (this.isSupported && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  static getInstance(): SpeechRecognitionManager {
    if (!SpeechRecognitionManager.instance) {
      SpeechRecognitionManager.instance = new SpeechRecognitionManager();
    }
    return SpeechRecognitionManager.instance;
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.lang = 'ja-JP';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  startListening(callbacks: {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {}): boolean {
    if (!this.isSupported || !this.recognition) {
      callbacks.onError?.('音声認識がサポートされていません');
      return false;
    }

    this.recognition.onstart = () => {
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      
      callbacks.onResult?.(transcript, isFinal);
    };

    this.recognition.onend = () => {
      callbacks.onEnd?.();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = '音声認識エラーが発生しました';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = '音声が検出されませんでした';
          break;
        case 'audio-capture':
          errorMessage = 'マイクにアクセスできません';
          break;
        case 'not-allowed':
          errorMessage = 'マイクの使用が許可されていません';
          break;
        case 'network':
          errorMessage = 'ネットワークエラーが発生しました';
          break;
      }
      
      callbacks.onError?.(errorMessage);
    };

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      callbacks.onError?.('音声認識を開始できませんでした');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isRecognitionSupported(): boolean {
    return this.isSupported;
  }
}

export const speechRecognition = SpeechRecognitionManager.getInstance();