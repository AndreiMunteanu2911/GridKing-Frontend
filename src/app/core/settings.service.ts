import { Injectable, effect, signal } from '@angular/core';

interface Settings {
  darkMode: boolean;
  muted: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly initial: Settings = JSON.parse(localStorage.getItem('gridking.settings') || '{"darkMode":false,"muted":false}');
  readonly darkMode = signal(this.initial.darkMode);
  readonly muted = signal(this.initial.muted);

  constructor() {
    effect(() => {
      const settings = { darkMode: this.darkMode(), muted: this.muted() };
      localStorage.setItem('gridking.settings', JSON.stringify(settings));
      document.documentElement.classList.toggle('dark', settings.darkMode);
    });
  }
}
