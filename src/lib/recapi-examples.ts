/**
 * Exemplos de uso do cliente RecAPI
 * Este arquivo serve apenas como referência e documentação
 */

import { cameras, clientes, streams, recApiClient } from "./recapi-client";

// ============================================
// EXEMPLOS DE USO - CÂMERAS
// ============================================

// Listar todas as câmeras
async function exemploListarCameras() {
  const todasCameras = await cameras.list();
  console.log(todasCameras);
}

// Listar câmeras com filtros
async function exemploListarCamerasComFiltros() {
  const camerasFiltradas = await cameras.list({
    serial: "GC6830377",
    status: "true",
    cliente: "1",
  });
  console.log(camerasFiltradas);
}

// Obter câmera por ID
async function exemploObterCameraPorId() {
  const camera = await cameras.getById(1);
  console.log(camera);
}

// Obter câmera por serial
async function exemploObterCameraPorSerial() {
  const camera = await cameras.getBySerial("GC6830377");
  console.log(camera);
}

// Criar nova câmera
async function exemploCriarCamera() {
  const novaCamera = await cameras.create({
    serial: "GC6830377",
    cliente_id: 1,
    validade_code: "ABC123",
    extended_info: "Informações adicionais",
  });
  console.log(novaCamera);
}

// Atualizar câmera (PUT - completo)
async function exemploAtualizarCamera() {
  const cameraAtualizada = await cameras.update(1, {
    nome: "Câmera Principal Atualizada",
    status: true,
    modelo: "DS-2CD2347G2-LU",
  });
  console.log(cameraAtualizada);
}

// Atualizar câmera parcialmente (PATCH)
async function exemploAtualizarCameraParcial() {
  const cameraAtualizada = await cameras.patch(1, {
    status: false,
  });
  console.log(cameraAtualizada);
}

// Deletar câmera
async function exemploDeletarCamera() {
  await cameras.delete(1);
  console.log("Câmera deletada com sucesso");
}

// Obter canais de uma câmera
async function exemploObterCanaisCamera() {
  const canais = await cameras.getChannels(1);
  console.log(canais);
}

// ============================================
// EXEMPLOS DE USO - CLIENTES
// ============================================

// Listar todos os clientes
async function exemploListarClientes() {
  const todosClientes = await clientes.list();
  console.log(todosClientes);
}

// Listar clientes com busca
async function exemploListarClientesComBusca() {
  const clientesEncontrados = await clientes.list({
    search: "Empresa",
  });
  console.log(clientesEncontrados);
}

// Obter cliente por ID
async function exemploObterClientePorId() {
  const cliente = await clientes.getById(1);
  console.log(cliente);
}

// Criar novo cliente
async function exemploCriarCliente() {
  const novoCliente = await clientes.create({
    nome: "Empresa XYZ",
    service_provider: "hikvision",
    custom_fields: {
      contato: "contato@empresa.com",
    },
  });
  console.log(novoCliente);
}

// Atualizar cliente (PUT - completo)
async function exemploAtualizarCliente() {
  const clienteAtualizado = await clientes.update(1, {
    nome: "Empresa XYZ Atualizada",
    service_provider: "hikvision",
  });
  console.log(clienteAtualizado);
}

// Atualizar cliente parcialmente (PATCH)
async function exemploAtualizarClienteParcial() {
  const clienteAtualizado = await clientes.patch(1, {
    nome: "Novo Nome",
  });
  console.log(clienteAtualizado);
}

// Deletar cliente
async function exemploDeletarCliente() {
  await clientes.delete(1);
  console.log("Cliente deletado com sucesso");
}

// ============================================
// EXEMPLOS DE USO - STREAMS
// ============================================

// Listar streams ativos
async function exemploListarStreams() {
  const streamsAtivos = await streams.list();
  console.log(streamsAtivos);
  console.log(`Total de streams: ${streamsAtivos.total_streams}`);
  streamsAtivos.streams.forEach((stream) => {
    console.log(`Stream: ${stream.stream_id} - Status: ${stream.status}`);
  });
}

// ============================================
// EXEMPLOS DE USO - CLIENTE COMPLETO
// ============================================

// Usar o cliente completo diretamente
async function exemploUsarClienteCompleto() {
  // Todas as operações disponíveis
  const cameras = await recApiClient.listCameras();
  const clientes = await recApiClient.listClientes();
  const streams = await recApiClient.listStreams();
  
  console.log({ cameras, clientes, streams });
}

// ============================================
// EXEMPLOS DE TRATAMENTO DE ERROS
// ============================================

async function exemploComTratamentoDeErro() {
  try {
    const camera = await cameras.getById(999);
    console.log(camera);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao buscar câmera:", error.message);
    }
    // Tratar diferentes tipos de erro da API
    // 404: Câmera não encontrada
    // 500: Erro interno do servidor
    // etc.
  }
}

