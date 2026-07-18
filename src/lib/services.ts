import type { Service } from "@/types/database";

export type ServiceAvailability =
  | "available"
  | "full"
  | "closed"
  | "unavailable";

export type PublicService = Service & {
  activeOrderCount: number | null;
  remainingQuota: number | null;
  availability: ServiceAvailability;
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const deadlineFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

export const availabilityLabels: Record<ServiceAvailability, string> = {
  available: "Tersedia",
  full: "Kuota penuh",
  closed: "Pendaftaran ditutup",
  unavailable: "Tidak tersedia",
};

export function formatRupiah(value: number) {
  return currencyFormatter.format(value).replace(/\s/g, "");
}

export function formatDeadline(value: string | null) {
  if (!value) return "Tidak ada batas waktu";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Tidak ada batas waktu"
    : deadlineFormatter.format(date);
}

export function hasDeadlinePassed(value: string | null, now = new Date()) {
  if (!value) return false;
  const deadline = new Date(value);
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < now.getTime();
}

export function truncateDescription(value: string | null, maximum = 145) {
  const fallback = "Detail jasa akan segera tersedia";
  const description = value?.trim() || fallback;

  if (description.length <= maximum) return description;
  return `${description.slice(0, maximum).trimEnd()}…`;
}

export function withServiceAvailability(
  service: Service,
  activeOrderCount: number | null,
  now = new Date(),
): PublicService {
  const remainingQuota =
    service.quota === null || activeOrderCount === null
      ? null
      : Math.max(service.quota - activeOrderCount, 0);

  let availability: ServiceAvailability = "available";

  if (!service.is_active) {
    availability = "unavailable";
  } else if (hasDeadlinePassed(service.deadline, now)) {
    availability = "closed";
  } else if (
    service.quota !== null &&
    activeOrderCount !== null &&
    activeOrderCount >= service.quota
  ) {
    availability = "full";
  } else if (service.quota !== null && activeOrderCount === null) {
    availability = "unavailable";
  }

  return {
    ...service,
    activeOrderCount,
    remainingQuota,
    availability,
  };
}
