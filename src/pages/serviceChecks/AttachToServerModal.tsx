import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Server } from "../../types/server";
import type { ServiceCheck } from "../../types/serviceCheck";
import { ApiClientError } from "../../services/api/client";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Select, type SelectOption } from "../../components/ui/Select";
import { serverService } from "../../services/serverService";
import { serviceCheckService } from "../../services/serviceCheckService";
import { TOAST_MESSAGES } from "../../constants/toastMessages";

interface AttachToServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCheck: ServiceCheck | null;
  onAttached: () => void;
}

export function AttachToServerModal({
  isOpen,
  onClose,
  serviceCheck,
  onAttached,
}: AttachToServerModalProps) {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      serverService
        .list()
        .then((res) => setServers(res.data.data ?? []))
        .catch(() => setServers([]));
      setSelectedServerId("");
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceCheck || !selectedServerId) return;
    setLoading(true);
    try {
      await serviceCheckService.attachToServer(
        Number(selectedServerId),
        serviceCheck.id
      );
      toast.success(TOAST_MESSAGES.ATTACH_SUCCESS);
      onAttached();
      onClose();
    } catch (err) {
      const msg =
        err instanceof ApiClientError && err.status === 409
          ? TOAST_MESSAGES.ATTACH_CONFLICT
          : TOAST_MESSAGES.ATTACH_ERROR;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const alreadyLinked = new Set(
    servers
      .filter(
        (s) =>
          s.service_checks?.some((sc) => sc.id === serviceCheck?.id) ?? false
      )
      .map((s) => s.id)
  );
  const serverOptions: SelectOption[] = servers
    .filter((s) => !alreadyLinked.has(s.id))
    .map((s) => ({
      value: String(s.id),
      label: `${s.name} (${s.ip_address})`,
    }));

  return (
    <Modal
      title={`Link "${serviceCheck?.name ?? ""}" to server`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="attach-form" disabled={loading || !selectedServerId || serverOptions.length === 0}>
            {loading ? "Linking..." : "Link"}
          </Button>
        </>
      }
    >
      <form id="attach-form" onSubmit={handleSubmit} className="space-y-4">
        {serverOptions.length === 0 ? (
          <p className="text-sm text-gray-600">
            All servers already have this service linked.
          </p>
        ) : (
          <Select
            label="Server"
            options={serverOptions}
            value={selectedServerId}
            onChange={(e) => setSelectedServerId(e.target.value)}
            placeholder="Select a server"
          />
        )}
      </form>
    </Modal>
  );
}
