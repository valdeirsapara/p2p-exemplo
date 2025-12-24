import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthCredentials } from "@/env";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Obtém as credenciais do .env (apenas no servidor)
    const authCredentials = getAuthCredentials();

    // Compara com as credenciais do .env
    if (username === authCredentials.USERNAME && password === authCredentials.PASSWORD) {
      // Cria um cookie de autenticação
      const cookieStore = await cookies();
      cookieStore.set("auth_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Erro ao processar login" },
      { status: 500 }
    );
  }
}

