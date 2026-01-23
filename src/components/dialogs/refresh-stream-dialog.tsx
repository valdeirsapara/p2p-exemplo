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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Camera } from "@/lib/recapi-types";
import { ErrorAlertDialog } from "../error-alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RefreshStreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera: Camera | null;
  onSuccess?: () => void;
}

export function RefreshStreamDialog({
  open,
  onOpenChange,
  camera,
  onSuccess,
}: RefreshStreamDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [protocol, setProtocol] = useState<string>("2"); // Default HLS
  const [quality, setQuality] = useState<string>("1"); // Default alta

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camera) return;

    setLoading(true);

    try {
      await api.post(`/api/cameras/${camera.id}/refresh-stream`, {
        protocol: parseInt(protocol, 10),
        quality: quality,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao atualizar stream:", error);
      setErrorDialog({
        open: true,
        message:
          error.response?.data?.error ||
          "Erro ao atualizar stream. Tente novamente.",
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
              <DialogTitle>Atualizar Stream</DialogTitle>
              <DialogDescription>
                Configure as opcoes de streaming para a camera{" "}
                <strong>{camera?.nome}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label>Tipo de Streaming *</Label>
                <RadioGroup
                  value={protocol}
                  onValueChange={setProtocol}
                  className="grid gap-2"
                >
                  <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="2" id="hls" />
                    <Label htmlFor="hls" className="flex-1 cursor-pointer">
                      <div className="font-medium">HLS</div>
                      <div className="text-xs text-muted-foreground">
                        HTTP Live Streaming - Compativel com a maioria dos navegadores
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="3" id="rtmp" />
                    <Label htmlFor="rtmp" className="flex-1 cursor-pointer">
                      <div className="font-medium">RTMP</div>
                      <div className="text-xs text-muted-foreground">
                        Real-Time Messaging Protocol - Menor latencia
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-3">
                <Label>Qualidade *</Label>
                <RadioGroup
                  value={quality}
                  onValueChange={setQuality}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="1" id="alta" />
                    <Label htmlFor="alta" className="cursor-pointer">
                      Alta
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="2" id="baixa" />
                    <Label htmlFor="baixa" className="cursor-pointer">
                      Baixa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {camera?.stream_expire_at && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="text-muted-foreground">
                    Stream atual expira em:{" "}
                    <strong>
                      {new Date(camera.stream_expire_at).toLocaleString("pt-BR")}
                    </strong>
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
                {loading ? "Atualizando..." : "Atualizar Stream"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ErrorAlertDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        title="Erro ao Atualizar Stream"
        message={errorDialog.message}
      />
    </>
  );
}
