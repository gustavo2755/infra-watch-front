import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Server, ServerCreate, ServerUpdate } from "../../types/server";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ApiClientError } from "../../services/api/client";
import { TOAST_MESSAGES } from "../../constants/toastMessages";

interface ServerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServerCreate | ServerUpdate) => Promise<void>;
  server?: Server | null;
  mode: "create" | "edit";
}

const defaultNumbers = {
  cpu_total: 4,
  ram_total: 8,
  disk_total: 100,
  check_interval_seconds: 60,
  retention_days: 30,
  cpu_alert_threshold: 90,
  ram_alert_threshold: 90,
  disk_alert_threshold: 90,
  bandwidth_alert_threshold: 100,
};

export function ServerFormModal({
  isOpen,
  onClose,
  onSubmit,
  server,
  mode,
}: ServerFormModalProps) {
  const [name, setName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [monitorResources, setMonitorResources] = useState(false);
  const [cpuTotal, setCpuTotal] = useState("");
  const [ramTotal, setRamTotal] = useState("");
  const [diskTotal, setDiskTotal] = useState("");
  const [checkIntervalSeconds, setCheckIntervalSeconds] = useState("");
  const [retentionDays, setRetentionDays] = useState("");
  const [cpuAlertThreshold, setCpuAlertThreshold] = useState("");
  const [ramAlertThreshold, setRamAlertThreshold] = useState("");
  const [diskAlertThreshold, setDiskAlertThreshold] = useState("");
  const [bandwidthAlertThreshold, setBandwidthAlertThreshold] = useState("");
  const [alertCpuEnabled, setAlertCpuEnabled] = useState(true);
  const [alertRamEnabled, setAlertRamEnabled] = useState(true);
  const [alertDiskEnabled, setAlertDiskEnabled] = useState(true);
  const [alertBandwidthEnabled, setAlertBandwidthEnabled] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (server) {
      setName(server.name);
      setIpAddress(server.ip_address);
      setDescription(server.description ?? "");
      setIsActive(server.is_active);
      setMonitorResources(server.monitor_resources);
      setCpuTotal(String(server.cpu_total ?? ""));
      setRamTotal(String(server.ram_total ?? ""));
      setDiskTotal(String(server.disk_total ?? ""));
      setCheckIntervalSeconds(String(server.check_interval_seconds ?? ""));
      setRetentionDays(String(server.retention_days ?? ""));
      setCpuAlertThreshold(String(server.cpu_alert_threshold ?? ""));
      setRamAlertThreshold(String(server.ram_alert_threshold ?? ""));
      setDiskAlertThreshold(String(server.disk_alert_threshold ?? ""));
      setBandwidthAlertThreshold(String(server.bandwidth_alert_threshold ?? ""));
      setAlertCpuEnabled(server.alert_cpu_enabled);
      setAlertRamEnabled(server.alert_ram_enabled);
      setAlertDiskEnabled(server.alert_disk_enabled);
      setAlertBandwidthEnabled(server.alert_bandwidth_enabled);
    } else {
      setName("");
      setIpAddress("");
      setDescription("");
      setIsActive(true);
      setMonitorResources(false);
      setCpuTotal(String(defaultNumbers.cpu_total));
      setRamTotal(String(defaultNumbers.ram_total));
      setDiskTotal(String(defaultNumbers.disk_total));
      setCheckIntervalSeconds(String(defaultNumbers.check_interval_seconds));
      setRetentionDays(String(defaultNumbers.retention_days));
      setCpuAlertThreshold(String(defaultNumbers.cpu_alert_threshold));
      setRamAlertThreshold(String(defaultNumbers.ram_alert_threshold));
      setDiskAlertThreshold(String(defaultNumbers.disk_alert_threshold));
      setBandwidthAlertThreshold(String(defaultNumbers.bandwidth_alert_threshold));
      setAlertCpuEnabled(true);
      setAlertRamEnabled(true);
      setAlertDiskEnabled(true);
      setAlertBandwidthEnabled(true);
    }
    setErrors({});
  }, [server, isOpen]);

  function parseNum(val: string): number {
    const n = Number(val);
    return Number.isFinite(n) ? Math.floor(n) : 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const base = {
        name,
        ip_address: ipAddress,
        description: description || null,
        is_active: isActive,
        monitor_resources: monitorResources,
        alert_cpu_enabled: alertCpuEnabled,
        alert_ram_enabled: alertRamEnabled,
        alert_disk_enabled: alertDiskEnabled,
        alert_bandwidth_enabled: alertBandwidthEnabled,
      };
      const data: ServerCreate | ServerUpdate =
        mode === "create"
          ? {
              ...base,
              cpu_total: parseNum(cpuTotal),
              ram_total: parseNum(ramTotal),
              disk_total: parseNum(diskTotal),
              check_interval_seconds: parseNum(checkIntervalSeconds),
              last_check_at: null,
              retention_days: parseNum(retentionDays),
              cpu_alert_threshold: parseNum(cpuAlertThreshold),
              ram_alert_threshold: parseNum(ramAlertThreshold),
              disk_alert_threshold: parseNum(diskAlertThreshold),
              bandwidth_alert_threshold: parseNum(bandwidthAlertThreshold),
            }
          : {
              ...base,
              ...(cpuTotal !== "" && { cpu_total: parseNum(cpuTotal) }),
              ...(ramTotal !== "" && { ram_total: parseNum(ramTotal) }),
              ...(diskTotal !== "" && { disk_total: parseNum(diskTotal) }),
              ...(checkIntervalSeconds !== "" && {
                check_interval_seconds: parseNum(checkIntervalSeconds),
              }),
              ...(retentionDays !== "" && {
                retention_days: parseNum(retentionDays),
              }),
              ...(cpuAlertThreshold !== "" && {
                cpu_alert_threshold: parseNum(cpuAlertThreshold),
              }),
              ...(ramAlertThreshold !== "" && {
                ram_alert_threshold: parseNum(ramAlertThreshold),
              }),
              ...(diskAlertThreshold !== "" && {
                disk_alert_threshold: parseNum(diskAlertThreshold),
              }),
              ...(bandwidthAlertThreshold !== "" && {
                bandwidth_alert_threshold: parseNum(bandwidthAlertThreshold),
              }),
            };
      await onSubmit(data);
      onClose();
    } catch (err) {
      const hasValidationErrors =
        err instanceof ApiClientError && err.errors && Object.keys(err.errors).length > 0;

      toast.error(
        hasValidationErrors
          ? TOAST_MESSAGES.VALIDATION_ERROR
          : TOAST_MESSAGES.SERVER_SAVE_ERROR
      );

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
      title={mode === "create" ? "New Server" : "Edit Server"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="server-form" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <form id="server-form" onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Basic information</h3>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={getFieldError("name")}
          />
          <Input
            label="IP Address"
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            required
            error={getFieldError("ip_address")}
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={getFieldError("description")}
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={monitorResources}
                onChange={(e) => setMonitorResources(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Monitor resources
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 [&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 [&>label]:mb-1">
            <label htmlFor="cpu-total">CPU total</label>
            <label htmlFor="ram-total">RAM total (GB)</label>
            <label htmlFor="disk-total">Disk total (GB)</label>
            <div>
              <Input
                id="cpu-total"
                type="number"
                min={1}
                value={cpuTotal}
                onChange={(e) => setCpuTotal(e.target.value)}
                error={getFieldError("cpu_total")}
              />
            </div>
            <div>
              <Input
                id="ram-total"
                type="number"
                min={1}
                value={ramTotal}
                onChange={(e) => setRamTotal(e.target.value)}
                error={getFieldError("ram_total")}
              />
            </div>
            <div>
              <Input
                id="disk-total"
                type="number"
                min={1}
                value={diskTotal}
                onChange={(e) => setDiskTotal(e.target.value)}
                error={getFieldError("disk_total")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Monitoring</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 [&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 [&>label]:mb-1">
            <label htmlFor="check-interval">Check interval (seconds)</label>
            <label htmlFor="retention-days">Retention (days)</label>
            <div>
              <Input
                id="check-interval"
                type="number"
                min={1}
                value={checkIntervalSeconds}
                onChange={(e) => setCheckIntervalSeconds(e.target.value)}
                error={getFieldError("check_interval_seconds")}
              />
            </div>
            <div>
              <Input
                id="retention-days"
                type="number"
                min={1}
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                error={getFieldError("retention_days")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Alert thresholds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 [&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 [&>label]:mb-1">
            <label htmlFor="cpu-threshold">CPU (%)</label>
            <label htmlFor="ram-threshold">RAM (%)</label>
            <label htmlFor="disk-threshold">Disk (%)</label>
            <label htmlFor="bandwidth-threshold">Bandwidth (%)</label>
            <div>
              <Input
                id="cpu-threshold"
                type="number"
                min={0}
                max={100}
                value={cpuAlertThreshold}
                onChange={(e) => setCpuAlertThreshold(e.target.value)}
                error={getFieldError("cpu_alert_threshold")}
              />
            </div>
            <div>
              <Input
                id="ram-threshold"
                type="number"
                min={0}
                max={100}
                value={ramAlertThreshold}
                onChange={(e) => setRamAlertThreshold(e.target.value)}
                error={getFieldError("ram_alert_threshold")}
              />
            </div>
            <div>
              <Input
                id="disk-threshold"
                type="number"
                min={0}
                max={100}
                value={diskAlertThreshold}
                onChange={(e) => setDiskAlertThreshold(e.target.value)}
                error={getFieldError("disk_alert_threshold")}
              />
            </div>
            <div>
              <Input
                id="bandwidth-threshold"
                type="number"
                min={0}
                value={bandwidthAlertThreshold}
                onChange={(e) => setBandwidthAlertThreshold(e.target.value)}
                error={getFieldError("bandwidth_alert_threshold")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Active alerts</h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alertCpuEnabled}
                onChange={(e) => setAlertCpuEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">CPU</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alertRamEnabled}
                onChange={(e) => setAlertRamEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">RAM</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alertDiskEnabled}
                onChange={(e) => setAlertDiskEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Disk</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alertBandwidthEnabled}
                onChange={(e) => setAlertBandwidthEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Bandwidth</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
