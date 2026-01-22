/**
 * Cliente API tipado para a RecAPI
 * Baseado na especificação OpenAPI
 */

import { recapi } from "./api";
import type {
  Camera,
  CameraCreateRequest,
  CameraUpdateRequest,
  CameraListParams,
  Cliente,
  ClienteCreateRequest,
  ClienteUpdateRequest,
  ClienteListParams,
  StreamListResponse,
  CameraChannelsResponse,
  RefreshStreamRequest,
  RefreshStreamResponse,
  RefreshStreamAsyncResponse,
} from "./recapi-types";

export class RecApiClient {
  /**
   * Lista todas as câmeras com filtros opcionais
   */
  async listCameras(params?: CameraListParams): Promise<Camera[]> {
    const response = await recapi.get<Camera[]>("/camera/", { params });
    return response.data;
  }

  /**
   * Obtém uma câmera pelo ID
   */
  async getCameraById(id: string): Promise<Camera> {
    const response = await recapi.get<Camera>(`/camera/${id}/`);
    return response.data;
  }

  /**
   * Obtém uma câmera pelo serial
   */
  async getCameraBySerial(serial: string): Promise<Camera> {
    const response = await recapi.get<Camera>(`/camera/${serial}`);
    return response.data;
  }

  /**
   * Cria uma nova câmera
   */
  async createCamera(data: CameraCreateRequest): Promise<Camera> {
    const response = await recapi.post<Camera>("/camera/", data);
    return response.data;
  }

  /**
   * Atualiza uma câmera completamente (PUT)
   */
  async updateCamera(id: number, data: CameraUpdateRequest): Promise<Camera> {
    const response = await recapi.put<Camera>(`/camera/${id}/`, data);
    return response.data;
  }

  /**
   * Atualiza uma câmera parcialmente (PATCH)
   */
  async patchCamera(id: number, data: Partial<CameraUpdateRequest>): Promise<Camera> {
    const response = await recapi.patch<Camera>(`/camera/${id}/`, data);
    return response.data;
  }

  /**
   * Deleta uma câmera
   */
  async deleteCamera(id: number): Promise<void> {
    await recapi.delete(`/camera/${id}/`);
  }

  /**
   * Obtém os canais de uma câmera
   */
  async getCameraChannels(cameraId: number): Promise<CameraChannelsResponse> {
    const response = await recapi.get<CameraChannelsResponse>(`/camera/${cameraId}/channels/`);
    return response.data;
  }

  /**
   * Atualiza/renova a URL de streaming RTMP da câmera
   */
  async refreshStream(cameraId: number, data?: RefreshStreamRequest): Promise<RefreshStreamResponse | RefreshStreamAsyncResponse> {
    const response = await recapi.post<RefreshStreamResponse | RefreshStreamAsyncResponse>(
      `/camera/${cameraId}/refresh-stream/`,
      data || {}
    );
    return response.data;
  }

  /**
   * Lista todos os clientes com busca opcional
   */
  async listClientes(params?: ClienteListParams): Promise<Cliente[]> {
    const response = await recapi.get<Cliente[]>("/cliente/", { params });
    return response.data;
  }

  /**
   * Obtém um cliente pelo ID
   */
  async getClienteById(id: number): Promise<Cliente> {
    const response = await recapi.get<Cliente>(`/cliente/${id}/`);
    return response.data;
  }

  /**
   * Cria um novo cliente
   */
  async createCliente(data: ClienteCreateRequest): Promise<Cliente> {
    const response = await recapi.post<Cliente>("/cliente/", data);
    return response.data;
  }

  /**
   * Atualiza um cliente completamente (PUT)
   */
  async updateCliente(id: number, data: ClienteUpdateRequest): Promise<Cliente> {
    const response = await recapi.put<Cliente>(`/cliente/${id}/`, data);
    return response.data;
  }

  /**
   * Atualiza um cliente parcialmente (PATCH)
   */
  async patchCliente(id: number, data: Partial<ClienteUpdateRequest>): Promise<Cliente> {
    const response = await recapi.patch<Cliente>(`/cliente/${id}/`, data);
    return response.data;
  }

  /**
   * Deleta um cliente (soft delete)
   */
  async deleteCliente(id: number): Promise<void> {
    await recapi.delete(`/cliente/${id}/`);
  }

  /**
   * Lista os streams HLS que estão rodando
   */
  async listStreams(): Promise<StreamListResponse> {
    const response = await recapi.get<StreamListResponse>("/stream/list/");
    return response.data;
  }

  /**
   * Endpoint de debug (contrib)
   */
  async getDebugInfo(): Promise<unknown> {
    const response = await recapi.get("/contrib/debug/");
    return response.data;
  }
}

// Instância singleton do cliente
export const recApiClient = new RecApiClient();

// Exportações individuais para uso direto
export const cameras = {
  list: (params?: CameraListParams) => recApiClient.listCameras(params),
  getById: (id: string) => recApiClient.getCameraById(id),
  getBySerial: (serial: string) => recApiClient.getCameraBySerial(serial),
  create: (data: CameraCreateRequest) => recApiClient.createCamera(data),
  update: (id: number, data: CameraUpdateRequest) => recApiClient.updateCamera(id, data),
  patch: (id: number, data: Partial<CameraUpdateRequest>) => recApiClient.patchCamera(id, data),
  delete: (id: number) => recApiClient.deleteCamera(id),
  getChannels: (cameraId: number) => recApiClient.getCameraChannels(cameraId),
  refreshStream: (cameraId: number, data?: RefreshStreamRequest) => recApiClient.refreshStream(cameraId, data),
};

export const clientes = {
  list: (params?: ClienteListParams) => recApiClient.listClientes(params),
  getById: (id: number) => recApiClient.getClienteById(id),
  create: (data: ClienteCreateRequest) => recApiClient.createCliente(data),
  update: (id: number, data: ClienteUpdateRequest) => recApiClient.updateCliente(id, data),
  patch: (id: number, data: Partial<ClienteUpdateRequest>) => recApiClient.patchCliente(id, data),
  delete: (id: number) => recApiClient.deleteCliente(id),
};

export const streams = {
  list: () => recApiClient.listStreams(),
};

export const debug = {
  get: () => recApiClient.getDebugInfo(),
};

