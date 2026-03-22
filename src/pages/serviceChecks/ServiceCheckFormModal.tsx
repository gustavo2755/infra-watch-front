import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { ServiceCheck, ServiceCheckCreate, ServiceCheckUpdate } from "../../types/serviceCheck";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ApiClientError } from "../../services/api/client";
import { TOAST_MESSAGES } from "../../constants/toastMessages";

interface ServiceCheckFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceCheckCreate | ServiceCheckUpdate) => Promise<void>;
  serviceCheck?: ServiceCheck | null;
  mode: "create" | "edit";
}

export function ServiceCheckFormModal({
  isOpen,
  onClose,
  onSubmit,
  serviceCheck,
  mode,
}: ServiceCheckFormModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceCheck) {
      setName(serviceCheck.name);
      setSlug(serviceCheck.slug);
      setDescription(serviceCheck.description ?? "");
    } else {
      setName("");
      setSlug("");
      setDescription("");
    }
    setErrors({});
  }, [serviceCheck, isOpen]);

  useEffect(() => {
    if (mode === "create" && name && !slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  }, [mode, name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const data: ServiceCheckCreate | ServiceCheckUpdate =
        mode === "create"
          ? { name, slug, description: description || null }
          : { name, slug, description: description || null };
      await onSubmit(data);
      onClose();
    } catch (err) {
      toast.error(TOAST_MESSAGES.SERVICE_CHECK_SAVE_ERROR);

      if (err instanceof ApiClientError && err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  }

  const getFieldError = (field: string) =>
    errors[field]?.[0] ?? errors[field.replace(/_/g, ".")]?.[0];

  return (
    <Modal
      title={mode === "create" ? "New Service" : "Edit Service"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="service-check-form" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <form id="service-check-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          error={getFieldError("name")}
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          error={getFieldError("slug")}
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={getFieldError("description")}
        />
      </form>
    </Modal>
  );
}
