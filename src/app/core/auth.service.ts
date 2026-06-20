import { Injectable, computed, signal } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { ApiService } from './api.service';
import { firebaseAuth } from './firebase';
import { UserProfile } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly authenticated = computed(() => !!this.user());
  readonly ready: Promise<void>;

  constructor(private readonly api: ApiService) {
    this.ready = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        this.user.set(user);
        if (user) {
          try {
            this.profile.set(await this.api.get<UserProfile>('/api/profiles/me'));
          } catch {
            this.profile.set(null);
          }
        } else {
          this.profile.set(null);
        }
        this.loading.set(false);
        resolve();
        unsubscribe();
        onAuthStateChanged(firebaseAuth, (next) => this.user.set(next));
      });
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    this.profile.set(await this.api.get<UserProfile>('/api/profiles/me'));
  }

  async register(email: string, password: string, username: string, visibleName: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    try {
      this.profile.set(await this.api.post<UserProfile>('/api/profiles', { username, visible_name: visibleName }));
    } catch (error) {
      await deleteUser(credential.user);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
    this.profile.set(null);
  }

  async refreshProfile(): Promise<void> {
    if (this.user()) this.profile.set(await this.api.get<UserProfile>('/api/profiles/me'));
  }
}
