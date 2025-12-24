import { NextResponse } from "next/server";
import { clientes } from "@/lib/recapi-client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await clientes.delete(id);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || "Erro ao deletar cliente" },
      { status: error.response?.status || 500 }
    );
  }
}

