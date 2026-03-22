import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Server } from "../../types/server";
import type { ServiceCheck } from "../../types/serviceCheck";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Select, type SelectOption } from "../../components/ui/Select";
import { serverService } from "../../services/serverService";
import { serviceCheckService } from "../../services/serviceCheckService";
import { TOAST_MESSAGES } from "../../constants/toastMessages";

interface DetachFromServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCheck: ServiceCheck | null;
  onDetached: () => void;
}

export function DetachFromServerModal({
  isOpen,
  onClose,
  serviceCheck,
  onDetached,
}: DetachFromServerModalProps) {
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

  const linkedServers = servers.filter(
    (s) =>
      s.service_checks?.some((sc) => sc.id === serviceCheck?.id) ?? false
  );

  const serverOptions: SelectOption[] = linkedServers.map((s) => ({
    value: String(s.id),
    label: `${s.name} (${s.ip_address})`,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!serviceCheck || !selectedServerId) return;
    setLoading(true);
    try {
      await serviceCheckService.detachFromServer(
        Number(selectedServerId),
        serviceCheck.id
      );
      toast.success(TOAST_MESSAGES.DETACH_SUCCESS);
      onDetached();
      onClose();
    } catch {
      toast.error(TOAST_MESSAGES.DETACH_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={`Unlink "${serviceCheck?.name ?? ""}" from server`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="detach-form"
            disabled={
              loading || !selectedServerId || serverOptions.length === 0
            }
          >
            {loading ? "Unlinking..." : "Unlink"}
          </Button>
        </>
      }
    >
      <form id="detach-form" onSubmit={handleSubmit} className="space-y-4">
        {serverOptions.length === 0 ? (
          <p className="text-sm text-gray-600">
            This service is not linked to any server.
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
