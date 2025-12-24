import { z } from "zod";

// Schema para variáveis públicas (disponíveis no cliente)
const EnvSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url({
        message: "NEXT_PUBLIC_API_URL deve ser uma URL válida",
    }),
    NEXT_PUBLIC_RECAPI_URL: z.string().url({
        message: "NEXT_PUBLIC_RECAPI_URL deve ser uma URL válida",
    }),
});

export type Env = z.infer<typeof EnvSchema>;

const envResult = EnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_RECAPI_URL: process.env.NEXT_PUBLIC_RECAPI_URL,
});

if (!envResult.success) {
    const missingVars = envResult.error.issues
        .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
    
    throw new Error(
        `❌ Variáveis de ambiente faltando ou inválidas:\n${missingVars}\n\n` +
        `Por favor, crie um arquivo .env.local na raiz do projeto com:\n` +
        `NEXT_PUBLIC_API_URL=http://localhost:3000\n` +
        `NEXT_PUBLIC_RECAPI_URL=http://136.248.95.88:8000\n` +
        `USERNAME=seu_usuario\n` +
        `PASSWORD=sua_senha\n` +
        `RECAPI_TOKEN=seu_token_aqui (opcional)`
    );
}

export const env = envResult.data;

// Schema para credenciais de autenticação (apenas servidor)
const AuthEnvSchema = z.object({
    USERNAME: z.string().min(1, {
        message: "USERNAME é obrigatório",
    }),
    PASSWORD: z.string().min(1, {
        message: "PASSWORD é obrigatório",
    }),
});

// Função para obter credenciais de autenticação (apenas no servidor)
export function getAuthCredentials() {
    const authResult = AuthEnvSchema.safeParse({
        USERNAME: process.env.USERNAME,
        PASSWORD: process.env.PASSWORD,
    });

    if (!authResult.success) {
        const missingVars = authResult.error.issues
            .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
            .join("\n");
        
        throw new Error(
            `❌ Variáveis de autenticação faltando ou inválidas:\n${missingVars}\n\n` +
            `Por favor, adicione no arquivo .env.local:\n` +
            `USERNAME=seu_usuario\n` +
            `PASSWORD=sua_senha`
        );
    }

    return authResult.data;
}
