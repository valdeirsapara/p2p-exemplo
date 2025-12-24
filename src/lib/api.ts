import axios from "axios";
import { env } from "@/env";

const api = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
});

const recapi = axios.create({
    baseURL: env.NEXT_PUBLIC_RECAPI_URL,
});

// Adiciona o token de autenticação em todas as requisições
recapi.interceptors.request.use((config) => {
    const token = process.env.RECAPI_TOKEN;
    if (token && token.trim() !== "") {
        config.headers.Authorization = `Token ${token}`;
    } else {
        console.warn("⚠️ RECAPI_TOKEN não está definido. As requisições à API podem falhar com erro 401.");
        console.warn("   Configure RECAPI_TOKEN no arquivo .env.local para autenticar as requisições.");
    }
    return config;
});

// Interceptor para tratar erros de autenticação
recapi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Erro de autenticação (401): Token inválido ou não fornecido");
            if (!process.env.RECAPI_TOKEN) {
                console.error("RECAPI_TOKEN não está definido nas variáveis de ambiente");
            }
        }
        return Promise.reject(error);
    }
);

export { api, recapi };