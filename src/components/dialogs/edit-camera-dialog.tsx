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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Camera, Cliente } from "@/lib/recapi-types";
import { ErrorAlertDialog } from "../error-alert-dialog";

interface EditCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera: Camera | null;
  clientesList: Cliente[];
  onSuccess?: () => void;
}

export function EditCameraDialog({
  open,
  onOpenChange,
  camera,
  clientesList,
  onSuccess,
}: EditCameraDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [formData, setFormData] = useState({
    nome: "",
    cliente_id: "",
  });

  useEffect(() => {
    if (camera && open) {
      setFormData({
        nome: camera.nome || "",
        cliente_id: camera.cliente?.toString() || "",
      });
    }
  }, [camera, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camera) return;

    setLoading(true);

    try {
      await api.patch(`/api/cameras/${camera.id}`, {
        nome: formData.nome,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao editar camera:", error);
      setErrorDialog({
        open: true,
        message:
          error.response?.data?.error || "Erro ao editar camera. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Camera</DialogTitle>
              <DialogDescription>
                Altere os dados da camera. O serial e a data de expiracao nao podem ser
                alterados.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="serial">Serial</Label>
                <Input
                  id="serial"
                  value={camera?.serial || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
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
                <Label htmlFor="cliente_id">Cliente</Label>
                <select
                  id="cliente_id"
                  value={formData.cliente_id}
                  disabled
                  className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sem cliente</option>
                  {clientesList.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  O cliente nao pode ser alterado apos a criacao.
                </p>
              </div>
              {camera?.stream_expire_at && (
                <div className="grid gap-2">
                  <Label>Expiracao do Stream</Label>
                  <Input
                    value={new Date(camera.stream_expire_at).toLocaleString("pt-BR")}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use o botao de refresh para renovar o stream.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
      </Dialog>

      <ErrorAlertDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        title="Erro ao Editar Camera"
        message={errorDialog.message}
      />
    </>
  );
}
