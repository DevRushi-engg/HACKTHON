import { Injectable } from '@angular/core';
import { Player } from './app';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly baseUrl = 'http://localhost:3001/api';

  /**
   * Fetches a short 3-sentence Gemini coach critique for the given squad.
   */
  async getCritique(squad: Player[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/critique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squad }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Backend error');
      }

      const data = await response.json();
      return data.critique;
    } catch (error: any) {
      console.error('[GeminiService.getCritique]', error);
      throw new Error(error.message || 'Failed to reach backend server');
    }
  }

  /**
   * Fetches a deep AI agent strategic report for the given squad JSON payload.
   */
  async getInsights(squad: Player[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squad }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Backend error');
      }

      const data = await response.json();
      return data.insights;
    } catch (error: any) {
      console.error('[GeminiService.getInsights]', error);
      throw new Error(error.message || 'Failed to reach backend server');
    }
  }

  /**
   * Health check — returns true if backend is reachable
   */
  async isBackendReachable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
