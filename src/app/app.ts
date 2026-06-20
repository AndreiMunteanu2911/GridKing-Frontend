import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './core/settings.service';
import { SoundService } from './core/sound.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(readonly settings: SettingsService, readonly sounds: SoundService) {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('button:not(.board-square), a')) this.sounds.ui();
    });
  }
}
