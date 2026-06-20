import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

type Tone = { frequency: number; duration: number; offset?: number; volume?: number };

@Injectable({ providedIn: 'root' })
export class SoundService {
  private context?: AudioContext;

  constructor(private readonly settings: SettingsService) {}

  ui(): void { this.play([{ frequency: 420, duration: 0.035, volume: 0.025 }]); }
  select(): void { this.play([{ frequency: 540, duration: 0.045, volume: 0.035 }]); }
  move(): void {
    this.play([
      { frequency: 260, duration: 0.055, volume: 0.05 },
      { frequency: 390, duration: 0.07, offset: 0.045, volume: 0.045 },
    ]);
  }
  match(): void {
    this.play([
      { frequency: 392, duration: 0.1 },
      { frequency: 523, duration: 0.1, offset: 0.1 },
      { frequency: 659, duration: 0.16, offset: 0.2 },
    ]);
  }
  win(): void {
    this.play([
      { frequency: 523, duration: 0.12 },
      { frequency: 659, duration: 0.12, offset: 0.12 },
      { frequency: 784, duration: 0.24, offset: 0.24 },
    ]);
  }
  lose(): void {
    this.play([
      { frequency: 330, duration: 0.14 },
      { frequency: 262, duration: 0.22, offset: 0.14 },
    ]);
  }

  private play(tones: Tone[]): void {
    if (this.settings.muted() || typeof window === 'undefined') return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume();
      const now = this.context.currentTime;
      for (const tone of tones) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const start = now + (tone.offset ?? 0);
        const end = start + tone.duration;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(tone.frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(tone.volume ?? 0.055, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(start);
        oscillator.stop(end + 0.01);
      }
    } catch {
      // Audio is optional and may be blocked by the host device.
    }
  }
}
