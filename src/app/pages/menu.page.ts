import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { AppShellComponent } from '../shared/app-shell.component';
import { MenuTileComponent } from '../shared/menu-tile.component';
import { SectionHeadingComponent } from '../shared/section-heading.component';

@Component({
  selector: 'app-menu-page',
  imports: [AppShellComponent, MenuTileComponent, SectionHeadingComponent],
  template: `
    <app-shell title="Home" subtitle="Choose a game mode and get on the board">
      <app-section-heading eyebrow="Welcome back" [title]="auth.profile()?.visible_name || 'Player'" />
      <section class="dashboard-grid">
        <app-menu-tile route="/online" icon="&#9876;" title="Play Online" description="Casual or ranked matchmaking" />
        <app-menu-tile route="/bot" icon="&#9823;" title="Play Against Bots" description="Practice against three AI levels" variant="yellow" />
        <app-menu-tile route="/leaderboard" icon="&#9819;" title="Leaderboard" description="Your stats and the global rankings" variant="cream" />
        <app-menu-tile route="/settings" icon="&#9881;" title="Settings" description="Theme and sound preferences" variant="dark" />
      </section>
    </app-shell>
  `,
})
export class MenuPage {
  constructor(readonly auth: AuthService) {}
}
