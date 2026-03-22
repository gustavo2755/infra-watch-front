import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Link2, Unlink, Trash2, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { Server, ServerCreate, ServerUpdate } from "../../types/server";
import { serverService } from "../../services/serverService";
import { serviceCheckService } from "../../services/serviceCheckService";
import { Button } from "../../components/ui/Button";
import { ActionButton } from "../../components/ui/ActionButton";
import { Badge } from "../../components/ui/Badge";
import { TOAST_MESSAGES } from "../../constants/toastMessages";
import { DataTable, type DataTableColumn } from "../../components/table/DataTable";
import { Pagination } from "../../components/table/Pagination";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { Input } from "../../components/ui/Input";
import { Select, type SelectOption } from "../../components/ui/Select";
import { ServerFormModal } from "./ServerFormModal";
import { LinkServiceCheckModal } from "./LinkServiceCheckModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

const PER_PAGE = 10;

const statusOptions: SelectOption[] = [
  { value: "", label: "All" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

export function ServersPage() {
  const navigate = useNavigate();
  const [servers, setServers] = useState<Server[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterName, setFilterName] = useState("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingServer, setLinkingServer] = useState<Server | null>(null);
  const [detachConfirm, setDetachConfirm] = useState<{
    server: Server;
    serviceCheck: { id: number; name: string };
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Server | null>(null);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const isActiveParam =
        filterActive === "" ? undefined : filterActive === "1";
      const res = await serverService.list({
        name: filterName || undefined,
        is_active: isActiveParam,
        page,
        per_page: PER_PAGE,
      });
      setServers(res.data.data ?? []);
      setTotal(res.data.meta?.total ?? res.data.count ?? 0);
    } catch {
      toast.error(TOAST_MESSAGES.SERVERS_FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  }, [filterName, filterActive, page]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleCreate = async (data: ServerCreate | ServerUpdate) => {
    await serverService.create(data as ServerCreate);
    toast.success(TOAST_MESSAGES.SERVER_CREATE_SUCCESS);
    fetchServers();
  };

  const handleUpdate = async (data: ServerCreate | ServerUpdate) => {
    if (!editingServer) return;
    await serverService.update(editingServer.id, data);
    toast.success(TOAST_MESSAGES.SERVER_UPDATE_SUCCESS);
    fetchServers();
  };

  const handleEdit = (server: Server) => {
    setEditingServer(server);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingServer(null);
  };

  const handleOpenLinkModal = (server: Server) => {
    setLinkingServer(server);
    setLinkModalOpen(true);
  };

  const handleCloseLinkModal = () => {
    setLinkModalOpen(false);
    setLinkingServer(null);
  };

  const handleDetach = async (
    server: Server,
    serviceCheck: { id: number; name: string }
  ) => {
    try {
      await serviceCheckService.detachFromServer(server.id, serviceCheck.id);
      toast.success(TOAST_MESSAGES.DETACH_SUCCESS);
      fetchServers();
    } catch {
      toast.error(TOAST_MESSAGES.DETACH_ERROR);
    }
  };

  const handleOpenDetachConfirm = (
    server: Server,
    serviceCheck: { id: number; name: string }
  ) => {
    setDetachConfirm({ server, serviceCheck });
  };

  const handleDelete = async (server: Server) => {
    try {
      await serverService.delete(server.id);
      toast.success(TOAST_MESSAGES.SERVER_DELETE_SUCCESS);
      fetchServers();
    } catch {
      toast.error(TOAST_MESSAGES.SERVER_DELETE_ERROR);
    }
  };

  const handleOpenDeleteConfirm = (server: Server) => {
    setDeleteConfirm(server);
  };

  const handleClearFilters = () => {
    setFilterName("");
    setFilterActive("");
    setPage(1);
  };

  const columns: DataTableColumn<Server>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "ip_address", label: "IP" },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <Badge variant={row.is_active ? "success" : "danger"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "monitor_resources",
      label: "Monitor",
      render: (row) => (
        <Badge variant={row.monitor_resources ? "info" : "warning"}>
          {row.monitor_resources ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "service_checks",
      label: "Services",
      render: (row) => (
        <div className="flex flex-wrap gap-1 items-center">
          {row.service_checks?.length ? (
            row.service_checks.map((sc) => (
              <span
                key={sc.id}
                className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium"
              >
                {sc.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDetachConfirm(row, sc);
                  }}
                  className="p-0.5 -mr-0.5 rounded hover:bg-rose-100 hover:text-rose-700 transition-colors"
                  title="Unlink"
                >
                  <Unlink className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-1">
          <ActionButton
            variant="view"
            tooltip="View logs"
            onClick={() => navigate(`/servers/${row.id}/logs`)}
          >
            <ScrollText className="w-4 h-4" />
          </ActionButton>
          <ActionButton
            variant="attach"
            tooltip="Link service"
            onClick={() => handleOpenLinkModal(row)}
          >
            <Link2 className="w-4 h-4" />
          </ActionButton>
          <ActionButton
            variant="edit"
            tooltip="Edit"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="w-4 h-4" />
          </ActionButton>
          <ActionButton
            variant="delete"
            tooltip="Delete"
            onClick={() => handleOpenDeleteConfirm(row)}
          >
            <Trash2 className="w-4 h-4" />
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Servers</h1>
        <Button onClick={() => { setEditingServer(null); setModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Server
        </Button>
      </div>

      <FilterPanel onClear={handleClearFilters}>
        <Input
          label="Name"
          placeholder="Search by name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        />
      </FilterPanel>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={servers}
            getRowKey={(row) => row.id}
          />
          <div className="mt-0">
            <Pagination
              page={page}
              perPage={PER_PAGE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <ServerFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={editingServer ? handleUpdate : handleCreate}
        server={editingServer}
        mode={editingServer ? "edit" : "create"}
      />

      <LinkServiceCheckModal
        isOpen={linkModalOpen}
        onClose={handleCloseLinkModal}
        server={linkingServer}
        onLinked={fetchServers}
      />

      <ConfirmModal
        isOpen={!!detachConfirm}
        onClose={() => setDetachConfirm(null)}
        onConfirm={() =>
          detachConfirm
            ? handleDetach(detachConfirm.server, detachConfirm.serviceCheck)
            : Promise.resolve()
        }
        title="Unlink"
        message={
          detachConfirm
            ? `Are you sure you want to unlink "${detachConfirm.serviceCheck.name}" from server "${detachConfirm.server.name}"?`
            : ""
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() =>
          deleteConfirm ? handleDelete(deleteConfirm) : Promise.resolve()
        }
        title="Delete Server"
        message={
          deleteConfirm
            ? `Are you sure you want to delete server "${deleteConfirm.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
