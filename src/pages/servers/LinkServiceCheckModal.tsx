import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Server } from "../../types/server";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Select, type SelectOption } from "../../components/ui/Select";
import { serviceCheckService } from "../../services/serviceCheckService";
import { ApiClientError } from "../../services/api/client";
import { TOAST_MESSAGES } from "../../constants/toastMessages";

interface LinkServiceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server | null;
  onLinked: () => void;
}

export function LinkServiceCheckModal({
  isOpen,
  onClose,
  server,
  onLinked,
}: LinkServiceCheckModalProps) {
  const [availableServiceChecks, setAvailableServiceChecks] = useState<
    { id: number; name: string; slug: string }[]
  >([]);
  const [selectedServiceCheckId, setSelectedServiceCheckId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen && server) {
      setLoadingOptions(true);
      setSelectedServiceCheckId("");
      serviceCheckService
        .getAvailableForServer(server.id)
        .then((res) => setAvailableServiceChecks(res.data.data ?? []))
        .catch(() => setAvailableServiceChecks([]))
        .finally(() => setLoadingOptions(false));
    }
  }, [isOpen, server]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!server || !selectedServiceCheckId) return;
    setLoading(true);
    try {
      await serviceCheckService.attachToServer(
        server.id,
        Number(selectedServiceCheckId)
      );
      toast.success(TOAST_MESSAGES.ATTACH_SUCCESS);
      onLinked();
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

  const serviceCheckOptions: SelectOption[] = availableServiceChecks.map(
    (sc) => ({
      value: String(sc.id),
      label: `${sc.name} (${sc.slug})`,
    })
  );

  return (
    <Modal
      title={`Link service to server "${server?.name ?? ""}"`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="link-form"
            disabled={
              loading ||
              !selectedServiceCheckId ||
              serviceCheckOptions.length === 0
            }
          >
            {loading ? "Linking..." : "Link"}
          </Button>
        </>
      }
    >
      <form id="link-form" onSubmit={handleSubmit} className="space-y-4">
        {loadingOptions ? (
          <p className="text-sm text-gray-600">Loading options...</p>
        ) : serviceCheckOptions.length === 0 ? (
          <p className="text-sm text-gray-600">
            All services are already linked to this server.
          </p>
        ) : (
          <Select
            label="Service"
            options={serviceCheckOptions}
            value={selectedServiceCheckId}
            onChange={(e) => setSelectedServiceCheckId(e.target.value)}
            placeholder="Select a service"
          />
        )}
      </form>
    </Modal>
  );
}
