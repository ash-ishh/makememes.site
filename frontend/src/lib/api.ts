import axios from 'axios';
import type { Template, RunResult, AssetsResponse, ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiClient {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  private getHeaders() {
    return this.apiKey ? { 'x-videodb-key': this.apiKey } : {};
  }

  async listTemplates(): Promise<Template[]> {
    const response = await api.get<{ templates: Template[] }>('/api/templates');
    return response.data.templates;
  }

  async getTemplate(templateId: string): Promise<Template> {
    const response = await api.get<Template>(`/api/templates/${templateId}`);
    return response.data;
  }

  async runTemplate(templateId: string, params: Record<string, any>): Promise<RunResult> {
    try {
      const response = await api.post<RunResult>(
        `/api/run/${templateId}`,
        { params },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error.response.data.error as ApiError;
      }
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  async runCustomCode(code: string, params: Record<string, any>): Promise<RunResult> {
    try {
      const response = await api.post<RunResult>(
        '/api/run-custom',
        { code, params },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error.response.data.error as ApiError;
      }
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  async listAssets(): Promise<AssetsResponse> {
    try {
      const response = await api.get<AssetsResponse>('/api/assets', {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error.response.data.error as ApiError;
      }
      throw new Error(error.message || 'Failed to fetch assets');
    }
  }

  async uploadFromUrl(url: string, name: string, mediaType: 'video' | 'image' | 'audio' = 'video'): Promise<{ asset_id: string; name: string; media_type: string }> {
    try {
      const response = await api.post<{ asset_id: string; name: string; media_type: string }>(
        '/api/upload-from-url',
        { url, name, media_type: mediaType },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error.response.data.error as ApiError;
      }
      throw new Error(error.message || 'Failed to upload media');
    }
  }

  async listMemeSources(): Promise<any[]> {
    try {
      const response = await api.get<{ meme_sources: any[] }>('/api/meme-bank');
      return response.data.meme_sources;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error.response.data.error as ApiError;
      }
      throw new Error(error.message || 'Failed to fetch meme sources');
    }
  }

  async checkMemeAvailability(): Promise<Record<string, { available: boolean; asset_id: string | null; asset_name: string | null }>> {
    try {
      const response = await api.get<{ availability: Record<string, any> }>(
        '/api/meme-bank/check',
        { headers: this.getHeaders() }
      );
      return response.data.availability;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error.response.data.error as ApiError;
      }
      throw new Error(error.message || 'Failed to check meme availability');
    }
  }

  async syncMemeToCollection(memeId: string): Promise<{ asset_id: string; name: string; media_type: string; meme_id: string }> {
    try {
      const response = await api.post<{ asset_id: string; name: string; media_type: string; meme_id: string }>(
        '/api/meme-bank/sync',
        { meme_id: memeId },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw error.response.data.error as ApiError;
      }
      throw new Error(error.message || 'Failed to sync meme');
    }
  }
}

export const apiClient = new ApiClient();
