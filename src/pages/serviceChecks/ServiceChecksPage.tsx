import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Link2, Unlink, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { ServiceCheck } from "../../types/serviceCheck";
import { serviceCheckService } from "../../services/serviceCheckService";
import { Button } from "../../components/ui/Button";
import { ActionButton } from "../../components/ui/ActionButton";
import { TOAST_MESSAGES } from "../../constants/toastMessages";
import { DataTable, type DataTableColumn } from "../../components/table/DataTable";
import { Pagination } from "../../components/table/Pagination";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { Input } from "../../components/ui/Input";
import { ServiceCheckFormModal } from "./ServiceCheckFormModal";
import { AttachToServerModal } from "./AttachToServerModal";
import { DetachFromServerModal } from "./DetachFromServerModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

const PER_PAGE = 10;

export function ServiceChecksPage() {
  const [serviceChecks, setServiceChecks] = useState<ServiceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterName, setFilterName] = useState("");
  const [filterSlug, setFilterSlug] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [detachModalOpen, setDetachModalOpen] = useState(false);
  const [editingServiceCheck, setEditingServiceCheck] =
    useState<ServiceCheck | null>(null);
  const [attachServiceCheck, setAttachServiceCheck] =
    useState<ServiceCheck | null>(null);
  const [detachServiceCheck, setDetachServiceCheck] =
    useState<ServiceCheck | null>(null);
  const [deleteConfirm, setDeleteConfirm] =
    useState<ServiceCheck | null>(null);

  const fetchServiceChecks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await serviceCheckService.list();
      setServiceChecks(res.data.data ?? []);
    } catch {
      toast.error(TOAST_MESSAGES.SERVICE_CHECKS_FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceChecks();
  }, [fetchServiceChecks]);

  const handleCreate = async (
    data: import("../../types/serviceCheck").ServiceCheckCreate | import("../../types/serviceCheck").ServiceCheckUpdate
  ) => {
    await serviceCheckService.create(data as import("../../types/serviceCheck").ServiceCheckCreate);
    toast.success(TOAST_MESSAGES.SERVICE_CHECK_CREATE_SUCCESS);
    fetchServiceChecks();
  };

  const handleUpdate = async (
    data: Parameters<typeof serviceCheckService.update>[1]
  ) => {
    if (!editingServiceCheck) return;
    await serviceCheckService.update(editingServiceCheck.id, data);
    toast.success(TOAST_MESSAGES.SERVICE_CHECK_UPDATE_SUCCESS);
    fetchServiceChecks();
  };

  const handleEdit = (sc: ServiceCheck) => {
    setEditingServiceCheck(sc);
    setModalOpen(true);
  };

  const handleAttach = (sc: ServiceCheck) => {
    setAttachServiceCheck(sc);
    setAttachModalOpen(true);
  };

  const handleDetach = (sc: ServiceCheck) => {
    setDetachServiceCheck(sc);
    setDetachModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingServiceCheck(null);
  };

  const handleCloseAttachModal = () => {
    setAttachModalOpen(false);
    setAttachServiceCheck(null);
  };

  const handleCloseDetachModal = () => {
    setDetachModalOpen(false);
    setDetachServiceCheck(null);
  };

  const handleDelete = async (sc: ServiceCheck) => {
    try {
      await serviceCheckService.delete(sc.id);
      toast.success(TOAST_MESSAGES.SERVICE_CHECK_DELETE_SUCCESS);
      fetchServiceChecks();
    } catch {
      toast.error(TOAST_MESSAGES.SERVICE_CHECK_DELETE_ERROR);
    }
  };

  const handleOpenDeleteConfirm = (sc: ServiceCheck) => {
    setDeleteConfirm(sc);
  };

  const handleClearFilters = () => {
    setFilterName("");
    setFilterSlug("");
  };

  const filtered = serviceChecks.filter((sc) => {
    if (filterName && !sc.name.toLowerCase().includes(filterName.toLowerCase()))
      return false;
    if (filterSlug && !sc.slug.toLowerCase().includes(filterSlug.toLowerCase()))
      return false;
    return true;
  });

  const paginatedChecks = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const columns: DataTableColumn<ServiceCheck>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description ?? "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-1">
          <ActionButton
            variant="edit"
            tooltip="Edit"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="w-4 h-4" />
          </ActionButton>
          <ActionButton
            variant="attach"
            tooltip="Link to server"
            onClick={() => handleAttach(row)}
          >
            <Link2 className="w-4 h-4" />
          </ActionButton>
          <ActionButton
            variant="delete"
            tooltip="Unlink from server"
            onClick={() => handleDetach(row)}
          >
            <Unlink className="w-4 h-4" />
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
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <Button
          onClick={() => {
            setEditingServiceCheck(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Service
        </Button>
      </div>

      <FilterPanel onClear={handleClearFilters}>
        <Input
          label="Name"
          placeholder="Search by name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <Input
          label="Slug"
          placeholder="Search by slug"
          value={filterSlug}
          onChange={(e) => setFilterSlug(e.target.value)}
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
            data={paginatedChecks}
            getRowKey={(row) => row.id}
          />
          <div className="mt-0">
            <Pagination
              page={page}
              perPage={PER_PAGE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <ServiceCheckFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={editingServiceCheck ? handleUpdate : handleCreate}
        serviceCheck={editingServiceCheck}
        mode={editingServiceCheck ? "edit" : "create"}
      />

      <AttachToServerModal
        isOpen={attachModalOpen}
        onClose={handleCloseAttachModal}
        serviceCheck={attachServiceCheck}
        onAttached={fetchServiceChecks}
      />

      <DetachFromServerModal
        isOpen={detachModalOpen}
        onClose={handleCloseDetachModal}
        serviceCheck={detachServiceCheck}
        onDetached={fetchServiceChecks}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() =>
          deleteConfirm ? handleDelete(deleteConfirm) : Promise.resolve()
        }
        title="Delete Service"
        message={
          deleteConfirm
            ? `Are you sure you want to delete service "${deleteConfirm.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
