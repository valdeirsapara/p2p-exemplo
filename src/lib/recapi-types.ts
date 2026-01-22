/**
 * Tipos TypeScript baseados na especificação OpenAPI da RecAPI
 */

export interface Camera {
  id: number;
  is_stream_expired?: boolean;
  criado_em?: string | null;
  modificado_em?: string | null;
  desativado_em?: string | null;
  slug?: string | null;
  serial: string;
  nome: string;
  modelo?: string | null;
  status: boolean;
  verification_code?: string;
  custom_fields?: {
    isSubscribed?: boolean;
    deviceVersion?: string;
    deviceCategory?: number;
    deviceShareFlag?: boolean;
    deviceSubCategory?: number;
    [key: string]: unknown;
  } | null;
  stream_url?: string | null;
  stream_id?: string | null;
  stream_expire_at?: string | null;
  criado_por?: number | null;
  modificado_por?: number | null;
  desativado_por?: number | null;
  cliente?: number | null;
}

export interface Cliente {
  id: number;
  nome: string;
  service_provider?: "hikconnect";
  custom_fields?: Record<string, unknown> | null;
  criado_por?: number | null;
  criado_em?: string | null;
  modificado_por?: number | null;
  modificado_em?: string | null;
}

export interface CameraCreateRequest {
  nome: string;
  serial: string;
  cliente_id: number;
  validade_code: string;
  userName?: string;
  password?: string;
  streamSecretKey?: string;
  timeZoneId?: number;
}

export interface CameraUpdateRequest {
  nome: string;
  userName?: string;
  password?: string;
  timeZoneId?: number;
}

export interface ClienteCreateRequest {
  nome: string;
  service_provider?: "hikconnect";
  custom_fields?: Record<string, unknown> | null;
  criado_por?: number | null;
}

export interface ClienteUpdateRequest {
  nome?: string;
  service_provider?: "hikconnect";
  custom_fields?: Record<string, unknown> | null;
  modificado_por?: number | null;
}

export interface RefreshStreamRequest {
  async?: boolean;
  protocol?: number; // 1=EZOPEN, 2=HLS, 3=RTMP (default)
  quality?: string; // '1' (alta) ou '2' (baixa, default)
  expireTime?: number; // Tempo em segundos (default: 86400 = 24h)
}

export interface RefreshStreamResponse {
  camera_id: number;
  stream_url: string;
  stream_id: string;
  expire_at: string;
}

export interface RefreshStreamAsyncResponse {
  message: string;
  task_id: string;
}

export interface CameraListParams {
  serial?: string;
  nome?: string;
  modelo?: string;
  status?: string;
  cliente?: string;
}

export interface ClienteListParams {
  search?: string;
}

export interface StreamInfo {
  stream_id: string;
  camera_id: number;
  camera_nome: string;
  camera_serial: string;
  hls_url: string;
  hls_file_exists: boolean;
  status: string;
  iniciado_em: string;
  ultima_verificacao: string;
  process_id: number;
}

export interface StreamListResponse {
  total_streams: number;
  streams: StreamInfo[];
}

export interface CameraChannelsResponse {
  channels: unknown[];
}

export interface ApiError {
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

