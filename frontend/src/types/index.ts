export interface SourceAsset {
  name: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  description?: string;
}

export interface Template {
  template_id: string;
  name: string;
  description: string;
  tags: string[];
  difficulty: string;
  params_schema?: ParamSchema[];
  demo_inputs?: Record<string, any>;
  code?: string;
  preview_stream_url?: string;
  source_assets?: SourceAsset[];
}

export interface ParamSchema {
  name: string;
  type: 'text' | 'number' | 'video_asset_id' | 'image_asset_id' | 'audio_asset_id' | 'color' | 'enum';
  required: boolean;
  default?: any;
  options?: string[];
}

export interface RunResult {
  stream_url: string;
  player_url: string;
  metadata: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface Asset {
  id: string;
  name: string;
  duration?: number;
}

export interface AssetsResponse {
  videos: Asset[];
  images: Asset[];
  audio: Asset[];
}
