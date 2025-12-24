"use client";

import { useEffect, useState } from "react";
import { HeaderBar } from "@/components/header-bar";
import { CreateClienteDialog } from "@/components/dialogs/create-cliente-dialog";
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
import { api } from "@/lib/api";
import { Cliente } from "@/lib/recapi-types";
import { Search, X, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ErrorAlertDialog } from "@/components/error-alert-dialog";

export default function ClientesPage() {
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    nome: string;
  }>({ open: false, id: null, nome: "" });
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });

  const fetchClientes = async (searchParam?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = searchParam ? `/api/clientes?search=${encodeURIComponent(searchParam)}` : "/api/clientes";
      const response = await api.get(url);
      setClientesList(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Erro de autenticação: Token inválido ou não configurado. Verifique a variável RECAPI_TOKEN no arquivo .env.local");
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || "Erro ao carregar clientes");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSearch = () => {
    fetchClientes(search);
  };

  const clearFilters = () => {
    setSearch("");
    fetchClientes();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleDeleteClick = (id: number, nome: string) => {
    setDeleteDialog({ open: true, id, nome });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return;

    try {
      await api.delete(`/api/clientes/${deleteDialog.id}`);
      fetchClientes();
    } catch (err: any) {
      setErrorDialog({
        open: true,
        message: err.response?.data?.error || "Erro ao deletar cliente",
      });
      console.error(err);
    }
  };

  return (
    <div>
      <HeaderBar title="Clientes">
        <CreateClienteDialog onSuccess={() => fetchClientes()} />
      </HeaderBar>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busque clientes pelo nome</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 grid gap-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Buscar por nome"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSearch} variant="outline" size="sm">
                <Search className="mr-2 size-4" />
                Buscar
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
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clientesList.length} cliente(s) encontrado(s)
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
                    <TableHead>Provedor</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Modificado em</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesList.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.id}</TableCell>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.service_provider || "-"}</TableCell>
                        <TableCell>{formatDate(cliente.criado_em)}</TableCell>
                        <TableCell>{formatDate(cliente.modificado_em)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteClick(cliente.id, cliente.nome)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Deletar cliente</span>
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
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteConfirm}
        title="Deletar Cliente"
        description="Tem certeza que deseja deletar o cliente"
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

