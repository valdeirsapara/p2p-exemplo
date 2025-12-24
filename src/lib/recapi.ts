/**
 * Arquivo de índice para facilitar importações do cliente RecAPI
 */

export * from "./recapi-types";
export * from "./recapi-client";

// Re-exportações mais convenientes
export {
  recApiClient,
  cameras,
  clientes,
  streams,
  debug,
} from "./recapi-client";

