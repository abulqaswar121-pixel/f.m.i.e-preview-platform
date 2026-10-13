import { Badge, type BadgeTone } from "@/components/common/Badge";
import { prStatuses } from "@/config/site";
import type { PRStatus } from "@/types";

const toneMap: Record<string, BadgeTone> = {
  neutral: "cream",
  info: "info",
  warning: "warning",
  success: "success",
  danger: "danger",
  muted: "muted",
};

function statusDefinition(status: PRStatus) {
  return prStatuses.find((entry) => entry.id === status);
}

export function StatusBadge({ status, className }: { status: PRStatus; className?: string }) {
  const definition = statusDefinition(status);
  return (
    <Badge tone={toneMap[definition?.tone ?? "neutral"] ?? "cream"} className={className}>
      {definition?.label ?? status.replace(/_/g, " ")}
    </Badge>
  );
}

export default StatusBadge;
