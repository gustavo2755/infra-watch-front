import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import type { Server } from "../../types/server";
import type { MonitoringLog } from "../../types/monitoringLog";
import { serverService } from "../../services/serverService";
import { monitoringLogService } from "../../services/monitoringLogService";
import { ApiClientError } from "../../services/api/client";
import { TOAST_MESSAGES } from "../../constants/toastMessages";
import { Badge } from "../../components/ui/Badge";
import { DataTable, type DataTableColumn } from "../../components/table/DataTable";
import { Pagination } from "../../components/table/Pagination";
import {
  MetricAreaChart,
  type MetricChartPoint,
} from "../../components/monitoring/MetricAreaChart";
import {
  formatMonitoringDateTime,
  parseMonitoringTimestamp,
} from "../../utils/formatDateTime";

const LOGS_PER_PAGE = 10;
const CHART_FETCH_PER_PAGE = 200;
const MONITORING_POLL_MS = 15_000;
const MONITORING_LOGS_MAX_FETCH = 500;

function monitoringLogsFetchSize(logsPage: number): number {
  const needed = Math.max(CHART_FETCH_PER_PAGE, logsPage * LOGS_PER_PAGE);
  return Math.min(needed, MONITORING_LOGS_MAX_FETCH);
}

function parseCollectionTotal(data: {
  meta?: { total?: number };
  count?: number;
  data?: unknown[];
}): number {
  return data.meta?.total ?? data.count ?? data.data?.length ?? 0;
}

function logsToChartPoints(logs: MonitoringLog[]): MetricChartPoint[] {
  return [...logs]
    .sort((a, b) => {
      const ta = parseMonitoringTimestamp(a.checked_at ?? a.created_at);
      const tb = parseMonitoringTimestamp(b.checked_at ?? b.created_at);
      return ta - tb;
    })
    .map((log) => {
      const ts = log.checked_at ?? log.created_at;
      const t = parseMonitoringTimestamp(ts);
      return {
        label:
          t > 0
            ? new Date(t).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
        cpu: log.cpu_usage_percent,
        ram: log.ram_usage_percent,
        disk: log.disk_usage_percent,
        bandwidth: log.bandwidth_usage_percent,
      };
    });
}

type TabId = "charts" | "logs";

export function ServerMonitoringPage() {
  const { serverId: serverIdParam } = useParams<{ serverId: string }>();
  const serverId = Number(serverIdParam);
  const idValid = Number.isFinite(serverId) && serverId > 0;

  const [server, setServer] = useState<Server | null>(null);
  const [serverNotFound, setServerNotFound] = useState(false);
  const [serverLoading, setServerLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabId>("charts");

  const [chartPoints, setChartPoints] = useState<MetricChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const [logs, setLogs] = useState<MonitoringLog[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [latestIsUp, setLatestIsUp] = useState<boolean | null>(null);

  useEffect(() => {
    if (!idValid) {
      setServerLoading(false);
      setServer(null);
      setServerNotFound(true);
      return;
    }

    let cancelled = false;
    setServerLoading(true);
    setServerNotFound(false);
    serverService
      .getById(serverId)
      .then((res) => {
        if (!cancelled) {
          setServer(res.data);
          setServerNotFound(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setServer(null);
          setServerNotFound(err instanceof ApiClientError && err.status === 404);

          if (!(err instanceof ApiClientError && err.status === 404)) {
            toast.error(TOAST_MESSAGES.SERVERS_FETCH_ERROR);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setServerLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idValid, serverId]);

  const loadMonitoringData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!idValid) return;
      const silent = opts?.silent === true;

      if (!silent) {
        setChartLoading(true);
        setLogsLoading(true);
      }
      try {
        const windowFits = logsPage * LOGS_PER_PAGE <= MONITORING_LOGS_MAX_FETCH;

        if (windowFits) {
          const perPage = monitoringLogsFetchSize(logsPage);
          const res = await monitoringLogService.listByServer(serverId, {
            page: 1,
            per_page: perPage,
          });
          const items = res.data.data ?? [];
          const forCharts = items.slice(0, CHART_FETCH_PER_PAGE);
          setChartPoints(logsToChartPoints(forCharts));
          const start = (logsPage - 1) * LOGS_PER_PAGE;
          setLogs(items.slice(start, start + LOGS_PER_PAGE));
          setLogsTotal(
            parseCollectionTotal(
              res.data as { meta?: { total?: number }; count?: number; data?: unknown[] }
            )
          );

          if (items.length > 0) {
            setLatestIsUp(items[0].is_up);
          } else {
            setLatestIsUp(null);
          }
        } else {
          const [chartRes, logRes] = await Promise.all([
            monitoringLogService.listByServer(serverId, {
              page: 1,
              per_page: CHART_FETCH_PER_PAGE,
            }),
            monitoringLogService.listByServer(serverId, {
              page: logsPage,
              per_page: LOGS_PER_PAGE,
            }),
          ]);
          const chartItems = chartRes.data.data ?? [];
          setChartPoints(logsToChartPoints(chartItems));
          const logItems = logRes.data.data ?? [];
          setLogs(logItems);
          setLogsTotal(
            parseCollectionTotal(
              logRes.data as { meta?: { total?: number }; count?: number; data?: unknown[] }
            )
          );

          if (chartItems.length > 0) {
            setLatestIsUp(chartItems[0].is_up);
          } else {
            setLatestIsUp(null);
          }
        }
      } catch {
        if (!silent) {
          toast.error(TOAST_MESSAGES.MONITORING_LOGS_FETCH_ERROR);
        }

        if (!silent) {
          setChartPoints([]);
          setLogs([]);
          setLogsTotal(0);
        }
      } finally {
        if (!silent) {
          setChartLoading(false);
          setLogsLoading(false);
        }
      }
    },
    [idValid, serverId, logsPage]
  );

  useEffect(() => {
    if (!idValid || serverLoading || server == null) return;
    void loadMonitoringData({ silent: false });
  }, [idValid, serverId, serverLoading, logsPage, loadMonitoringData]);

  const canPollMonitoring = idValid && !serverLoading && server != null;

  useEffect(() => {
    if (!canPollMonitoring) return;
    const tick = () => {
      void loadMonitoringData({ silent: true });
      void serverService
        .getById(serverId)
        .then((res) => setServer(res.data))
        .catch(() => {});
    };
    const intervalId = window.setInterval(tick, MONITORING_POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [canPollMonitoring, serverId, loadMonitoringData]);

  const lastCheckLabel = useMemo(
    () => formatMonitoringDateTime(server?.last_check_at),
    [server?.last_check_at]
  );

  const statusDotTitle =
    latestIsUp === true
      ? "Server reachable"
      : latestIsUp === false
        ? "Server reported down"
        : "Status unknown";

  const logColumns: DataTableColumn<MonitoringLog>[] = useMemo(
    () => [
      {
        key: "checked_at",
        label: "Checked at",
        render: (row) =>
          formatMonitoringDateTime(row.checked_at ?? row.created_at),
      },
      {
        key: "is_up",
        label: "Up",
        render: (row) => (
          <Badge variant={row.is_up ? "success" : "danger"}>
            {row.is_up ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        key: "cpu_usage_percent",
        label: "CPU %",
        render: (row) =>
          row.cpu_usage_percent != null ? row.cpu_usage_percent : "—",
      },
      {
        key: "ram_usage_percent",
        label: "RAM %",
        render: (row) =>
          row.ram_usage_percent != null ? row.ram_usage_percent : "—",
      },
      {
        key: "disk_usage_percent",
        label: "Disk %",
        render: (row) =>
          row.disk_usage_percent != null ? row.disk_usage_percent : "—",
      },
      {
        key: "bandwidth_usage_percent",
        label: "Bandwidth %",
        render: (row) =>
          row.bandwidth_usage_percent != null
            ? row.bandwidth_usage_percent
            : "—",
      },
      {
        key: "is_alert",
        label: "Alert",
        render: (row) => (
          <Badge variant={row.is_alert ? "danger" : "success"}>
            {row.is_alert ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        key: "alert_type",
        label: "Alert type",
        render: (row) => row.alert_type ?? "—",
      },
      {
        key: "error_message",
        label: "Message",
        render: (row) => {
          const d = row.error_message;

          if (!d) return "—";

          const max = 48;
          return d.length > max ? `${d.slice(0, max)}…` : d;
        },
      },
    ],
    []
  );

  if (!idValid) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-gray-600 mb-4">Invalid server.</p>
        <Link to="/servers" className="text-sky-600 font-medium hover:underline">
          Back to servers
        </Link>
      </div>
    );
  }

  if (serverLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (serverNotFound || !server) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-gray-600 mb-4">Server not found.</p>
        <Link to="/servers" className="text-sky-600 font-medium hover:underline">
          Back to servers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/servers"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to servers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring</h1>
        <p
          className="text-lg text-gray-700 mt-1 flex items-center gap-2"
          aria-label={`${server.name}. ${statusDotTitle}`}
        >
          <span
            className={`inline-block w-3 h-3 rounded-full shrink-0 ${
              latestIsUp === true
                ? "bg-emerald-500"
                : latestIsUp === false
                  ? "bg-red-500"
                  : "bg-gray-300"
            }`}
            title={statusDotTitle}
            aria-hidden
          />
          <span>{server.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Last check:{" "}
          <span className="text-gray-800 font-medium tabular-nums">
            {lastCheckLabel}
          </span>
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("charts")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "charts"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Charts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "logs"
              ? "border-sky-600 text-sky-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Logs
        </button>
      </div>

      {activeTab === "charts" && (
        <div className="space-y-4">
          {chartLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : chartPoints.length === 0 ? (
            <p className="text-center text-gray-500 py-12 bg-white rounded-lg border border-gray-200">
              No log data yet.
            </p>
          ) : (
            <>
              <MetricAreaChart
                title="CPU %"
                data={chartPoints}
                dataKey="cpu"
                color="#2563eb"
                threshold={server.cpu_alert_threshold}
                thresholdEnabled={server.alert_cpu_enabled}
              />
              <MetricAreaChart
                title="RAM %"
                data={chartPoints}
                dataKey="ram"
                color="#16a34a"
                threshold={server.ram_alert_threshold}
                thresholdEnabled={server.alert_ram_enabled}
              />
              <MetricAreaChart
                title="Disk %"
                data={chartPoints}
                dataKey="disk"
                color="#ca8a04"
                threshold={server.disk_alert_threshold}
                thresholdEnabled={server.alert_disk_enabled}
              />
              <MetricAreaChart
                title="Bandwidth %"
                data={chartPoints}
                dataKey="bandwidth"
                color="#9333ea"
                threshold={server.bandwidth_alert_threshold}
                thresholdEnabled={server.alert_bandwidth_enabled}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "logs" && (
        <>
          {logsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <DataTable
                columns={logColumns}
                data={logs}
                getRowKey={(row) => row.id}
              />
              <div className="mt-0">
                <Pagination
                  page={logsPage}
                  perPage={LOGS_PER_PAGE}
                  total={logsTotal}
                  onPageChange={setLogsPage}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
