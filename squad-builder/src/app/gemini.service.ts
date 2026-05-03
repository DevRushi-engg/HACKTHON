import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface GeminiCritiqueResponse {
  critique: string;
}

export interface GeminiInsightsResponse {
  insights: string;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  // Points to our Express backend — change this to your deployed URL in production
  private readonly API_BASE = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Gets a quick 3-sentence Gemini Coach Critique for the given squad.
   * Calls POST /api/critique on the Express backend.
   */
  async getCritique(squad: any[]): Promise<string> {
    try {
      const result = await firstValueFrom(
        this.http.post<GeminiCritiqueResponse>(`${this.API_BASE}/critique`, { squad })
      );
      return result.critique;
    } catch (err: any) {
      console.error('[GeminiService.getCritique]', err);
      const msg = err?.error?.error ?? err?.message ?? 'Unknown error';
      throw new Error(`Critique failed: ${msg}`);
    }
  }

  /**
   * Gets a detailed AI Agent strategic report for the given squad.
   * Calls POST /api/insights on the Express backend.
   * Returns HTML string (markdown converted server-side).
   */
  async getInsights(squad: any[]): Promise<string> {
    try {
      const result = await firstValueFrom(
        this.http.post<GeminiInsightsResponse>(`${this.API_BASE}/insights`, { squad })
      );
      return result.insights;
    } catch (err: any) {
      console.error('[GeminiService.getInsights]', err);
      const msg = err?.error?.error ?? err?.message ?? 'Unknown error';
      throw new Error(`Insights failed: ${msg}`);
    }
  }
}
