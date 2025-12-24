"use client";

import { useEffect, useState } from "react";
import { Camera, CameraListParams } from "@/lib/recapi-types";
import { Cliente } from "@/lib/recapi-types";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "../delete-confirm-dialog";
import { ErrorAlertDialog } from "../error-alert-dialog";

interface CamerasTableProps {
  refreshKey?: number;
}

export function CamerasTable({ refreshKey }: CamerasTableProps) {
  const [camerasList, setCamerasList] = useState<Camera[]>([]);
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CameraListParams>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    nome: string;
  }>({ open: false, id: null, nome: "" });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });

  const fetchCameras = async (filterParams: CameraListParams = filters) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterParams.serial) params.append("serial", filterParams.serial);
      if (filterParams.nome) params.append("nome", filterParams.nome);
      if (filterParams.modelo) params.append("modelo", filterParams.modelo);
      if (filterParams.status) params.append("status", filterParams.status);
      if (filterParams.cliente) params.append("cliente", filterParams.cliente);
      
      const response = await api.get(`/api/cameras?${params.toString()}`);
      setCamerasList(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Erro de autenticação: Token inválido ou não configurado. Verifique a variável RECAPI_TOKEN no arquivo .env.local");
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || "Erro ao carregar câmeras");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await api.get("/api/clientes");
      setClientesList(response.data);
    } catch (err: any) {
      console.error("Erro ao carregar clientes:", err);
      if (err.response?.status === 401) {
        console.error("Erro de autenticação: Token inválido ou não configurado");
      }
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    fetchCameras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleFilterChange = (key: keyof CameraListParams, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    fetchCameras({});
  };

  const handleDeleteClick = (id: number, nome: string) => {
    setDeleteDialog({ open: true, id, nome });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return;

    try {
      await api.delete(`/api/cameras/${deleteDialog.id}`);
      fetchCameras(filters);
    } catch (err: any) {
      setErrorDialog({
        open: true,
        message: err.response?.data?.error || "Erro ao deletar câmera",
      });
      console.error(err);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          status
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}
      >
        {status ? "Ativa" : "Inativa"}
      </span>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre as câmeras pelos campos abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-serial">Serial</Label>
              <Input
                id="filter-serial"
                placeholder="Buscar por serial"
                value={filters.serial || ""}
                onChange={(e) => handleFilterChange("serial", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-nome">Nome</Label>
              <Input
                id="filter-nome"
                placeholder="Buscar por nome"
                value={filters.nome || ""}
                onChange={(e) => handleFilterChange("nome", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-modelo">Modelo</Label>
              <Input
                id="filter-modelo"
                placeholder="Buscar por modelo"
                value={filters.modelo || ""}
                onChange={(e) => handleFilterChange("modelo", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-status">Status</Label>
              <select
                id="filter-status"
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Todos</option>
                <option value="true">Ativa</option>
                <option value="false">Inativa</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-cliente">Cliente</Label>
              <select
                id="filter-cliente"
                value={filters.cliente || ""}
                onChange={(e) => handleFilterChange("cliente", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Todos</option>
                {clientesList.map((cliente) => (
                  <option key={cliente.id} value={cliente.id.toString()}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => fetchCameras(filters)} variant="outline" size="sm">
              <Search className="mr-2 size-4" />
              Filtrar
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="mr-2 size-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Câmeras</CardTitle>
          <CardDescription>
            {camerasList.length} câmera(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Streaming Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {camerasList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Nenhuma câmera encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  camerasList.map((camera) => (
                    <TableRow key={camera.id}>
                      <TableCell>{camera.id}</TableCell>
                      <TableCell className="font-medium">{camera.nome}</TableCell>
                      <TableCell>{camera.serial}</TableCell>
                      <TableCell>{camera.modelo || "-"}</TableCell>
                      <TableCell>{getStatusBadge(camera.status)}</TableCell>
                      <TableCell>
                        {clientesList.find((c) => c.id === camera.cliente)?.nome || "-"}
                      </TableCell>
                      <TableCell>
                        {camera.streaming_status ? (
                          <span className="text-green-600">Ativo</span>
                        ) : (
                          <span className="text-muted-foreground">Inativo</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(camera.criado_em)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(camera.id, camera.nome)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Deletar câmera</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteConfirm}
        title="Deletar Câmera"
        description="Tem certeza que deseja deletar a câmera"
        itemName={deleteDialog.nome}
      />

      <ErrorAlertDialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        title="Erro"
        message={errorDialog.message}
      />
    </div>
  );
}

