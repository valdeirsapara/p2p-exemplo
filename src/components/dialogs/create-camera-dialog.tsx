"use client";

import { useState, useEffect } from "react";
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
import { Cliente } from "@/lib/recapi-types";
import { Plus } from "lucide-react";
import { ErrorAlertDialog } from "../error-alert-dialog";

interface CreateCameraDialogProps {
  onSuccess?: () => void;
}

export function CreateCameraDialog({ onSuccess }: CreateCameraDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [formData, setFormData] = useState({
    nome: "",
    serial: "",
    cliente_id: "",
    validade_code: "",
    extended_info: "",
  });

  useEffect(() => {
    if (open) {
      api.get("/api/clientes")
        .then((response) => setClientesList(response.data))
        .catch(console.error);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/cameras", {
        nome: formData.nome,
        serial: formData.serial,
        cliente_id: parseInt(formData.cliente_id),
        validade_code: formData.validade_code,
        extended_info: formData.extended_info || undefined,
      });
      setOpen(false);
      setFormData({
        nome: "",
        serial: "",
        cliente_id: "",
        validade_code: "",
        extended_info: "",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao criar câmera:", error);
      setErrorDialog({
        open: true,
        message: error.response?.data?.error || "Erro ao criar câmera. Tente novamente.",
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
          Nova Câmera
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Câmera</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar uma nova câmera.
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
                placeholder="Nome da camera"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serial">Serial *</Label>
              <Input
                id="serial"
                value={formData.serial}
                onChange={(e) =>
                  setFormData({ ...formData, serial: e.target.value })
                }
                placeholder="Serial da camera"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <select
                id="cliente_id"
                value={formData.cliente_id}
                onChange={(e) =>
                  setFormData({ ...formData, cliente_id: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Selecione um cliente</option>
                {clientesList.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validade_code">Código de Validação *</Label>
              <Input
                id="validade_code"
                value={formData.validade_code}
                onChange={(e) =>
                  setFormData({ ...formData, validade_code: e.target.value })
                }
                placeholder="Código de validação"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="extended_info">Informações Extras</Label>
              <Input
                id="extended_info"
                value={formData.extended_info}
                onChange={(e) =>
                  setFormData({ ...formData, extended_info: e.target.value })
                }
                placeholder="Informações adicionais (opcional)"
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
        title="Erro ao Criar Câmera"
        message={errorDialog.message}
      />
    </Dialog>
  );
}

