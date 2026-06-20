import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthUser, SessionPayload } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private idToken = '';
  private refreshToken = localStorage.getItem('gridking.refresh_token') || '';
  private expiresAt = 0;

  async publicPost<T>(path: string, body: unknown): Promise<T> {
    return this.fetchJson<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  setSession(session: SessionPayload): void {
    this.idToken = session.id_token;
    this.refreshToken = session.refresh_token;
    this.expiresAt = Date.now() + Math.max(0, Number(session.expires_in) - 60) * 1000;
    localStorage.setItem('gridking.refresh_token', session.refresh_token);
  }

  clearSession(): void {
    this.idToken = '';
    this.refreshToken = '';
    this.expiresAt = 0;
    localStorage.removeItem('gridking.refresh_token');
  }

  async restoreSession(): Promise<AuthUser | null> {
    if (!this.refreshToken) return null;
    try {
      return (await this.refresh()).user;
    } catch {
      this.clearSession();
      return null;
    }
  }

  async getToken(): Promise<string> {
    if (this.idToken && Date.now() < this.expiresAt) return this.idToken;
    if (!this.refreshToken) throw new Error('You must be signed in.');
    await this.refresh();
    return this.idToken;
  }

  private async request<T>(path: string, init: RequestInit, retried = false): Promise<T> {
    const token = await this.getToken();
    try {
      return await this.fetchJson<T>(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } });
    } catch (error) {
      if (!retried && error instanceof ApiError && error.status === 401 && this.refreshToken) {
        await this.refresh();
        return this.request<T>(path, init, true);
      }
      throw error;
    }
  }

  private async refresh(): Promise<SessionPayload> {
    const session = await this.publicPost<SessionPayload>('/auth/refresh', { refresh_token: this.refreshToken });
    this.setSession(session);
    return session;
  }

  private async fetchJson<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${environment.apiUrl}${path}`, init);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(response.status, payload.error || 'The server rejected the request.');
    return payload as T;
  }
}

class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}
