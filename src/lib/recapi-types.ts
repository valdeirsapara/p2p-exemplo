/**
 * Tipos TypeScript baseados na especificação OpenAPI da RecAPI
 */

export interface Camera {
  id: number;
  streaming_url?: string;
  streaming_status?: string;
  criado_em?: string | null;
  modificado_em?: string | null;
  desativado_em?: string | null;
  slug?: string | null;
  serial: string;
  nome: string;
  modelo?: string | null;
  status: boolean;
  verification_code?: string;
  custom_fields?: Record<string, unknown> | null;
  criado_por?: number | null;
  modificado_por?: number | null;
  desativado_por?: number | null;
  cliente: number;
}

export interface Cliente {
  id: number;
  nome: string;
  service_provider?: "hikvision";
  custom_fields?: Record<string, unknown> | null;
  criado_por?: number | null;
  criado_em?: string | null;
  modificado_por?: number | null;
  modificado_em?: string | null;
}

export interface CameraCreateRequest {
  serial: string;
  cliente_id: number;
  validade_code: string;
  extended_info?: string;
}

export interface CameraUpdateRequest {
  serial?: string;
  nome?: string;
  modelo?: string;
  status?: boolean;
  verification_code?: string;
  custom_fields?: Record<string, unknown> | null;
  criado_por?: number | null;
  desativado_por?: number | null;
  cliente?: number;
}

export interface ClienteCreateRequest {
  nome: string;
  service_provider?: "hikvision";
  custom_fields?: Record<string, unknown> | null;
  criado_por?: number | null;
}

export interface ClienteUpdateRequest {
  nome?: string;
  service_provider?: "hikvision";
  custom_fields?: Record<string, unknown> | null;
  modificado_por?: number | null;
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

