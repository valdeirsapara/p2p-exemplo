"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { ErrorAlertDialog } from "../error-alert-dialog";

interface CreateClienteDialogProps {
  onSuccess?: () => void;
}

export function CreateClienteDialog({ onSuccess }: CreateClienteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [formData, setFormData] = useState({
    nome: "",
    service_provider: "hikvision" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/clientes", formData);
      setOpen(false);
      setFormData({ nome: "", service_provider: "hikvision" });
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      setErrorDialog({
        open: true,
        message: error.response?.data?.error || "Erro ao criar cliente. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um novo cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service_provider">Provedor de Serviço</Label>
              <Input
                id="service_provider"
                value={formData.service_provider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    service_provider: e.target.value as "hikvision",
                  })
                }
                placeholder="hikvision"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ErrorAlertDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        title="Erro ao Criar Cliente"
        message={errorDialog.message}
      />
    </Dialog>
  );
}

