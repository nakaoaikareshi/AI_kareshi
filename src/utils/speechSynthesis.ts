export class SpeechSynthesisManager {
  private static instance: SpeechSynthesisManager;
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private constructor() {
    this.synth = window.speechSynthesis;
  }

  static getInstance(): SpeechSynthesisManager {
    if (!SpeechSynthesisManager.instance) {
      SpeechSynthesisManager.instance = new SpeechSynthesisManager();
    }
    return SpeechSynthesisManager.instance;
  }

  speak(text: string, options: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: SpeechSynthesisErrorEvent) => void;
  } = {}): void {
    if (this.currentUtterance) {
      this.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = 'ja-JP';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;

    if (options.voice) {
      const voices = this.getJapaneseVoices();
      const selectedVoice = voices.find(voice => 
        voice.name.includes(options.voice!) || voice.voiceURI.includes(options.voice!)
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      const femaleVoice = this.getJapaneseVoices().find(voice => 
        voice.name.includes('Female') || voice.name.includes('女性') || voice.name.includes('Kyoko')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (error) => {
      this.currentUtterance = null;
      options.onError?.(error);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.currentUtterance) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }

  getJapaneseVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices().filter(voice => 
      voice.lang.startsWith('ja') || voice.lang.startsWith('jp')
    );
  }

  getAllVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  getCharacterVoice(gender: 'boyfriend' | 'girlfriend'): SpeechSynthesisVoice | null {
    const voices = this.getJapaneseVoices();
    
    if (gender === 'girlfriend') {
      return voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('女性') || 
        voice.name.includes('Kyoko') ||
        voice.name.includes('Haruka')
      ) || voices[0] || null;
    } else {
      return voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('男性') || 
        voice.name.includes('Kenji') ||
        voice.name.includes('Ichiro')
      ) || voices[0] || null;
    }
  }
}

export const speechSynthesis = SpeechSynthesisManager.getInstance();