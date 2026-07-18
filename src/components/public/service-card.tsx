import {
  ArrowRight,
  CalendarClock,
  TicketCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { ServiceImage } from "@/components/public/service-image";
import { buttonStyles } from "@/components/ui/button";
import {
  availabilityLabels,
  formatDeadline,
  formatRupiah,
  truncateDescription,
  type PublicService,
  type ServiceAvailability,
} from "@/lib/services";
import { cn } from "@/lib/utils";

const statusStyles: Record<ServiceAvailability, string> = {
  available: "bg-emerald-300",
  full: "bg-secondary/45",
  closed: "bg-primary",
  unavailable: "bg-ink/10",
};

export function AvailabilityBadge({
  availability,
}: {
  availability: ServiceAvailability;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full rounded-full border-2 border-ink px-2 py-0.5 text-center text-xs font-bold leading-tight sm:px-2.5",
        statusStyles[availability],
      )}
    >
      {availabilityLabels[availability]}
    </span>
  );
}

export function ServiceCard({ service }: { service: PublicService }) {
  return (
    <article className="brutal-card flex h-full min-w-0 flex-col overflow-hidden bg-surface">
      <ServiceImage
        className="border-b-3 border-ink"
        imageUrl={service.image_url}
        name={service.name}
        variant="card"
      />

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5 lg:p-6">
        <div className="flex min-w-0 flex-col items-start gap-2 sm:gap-3">
          <AvailabilityBadge availability={service.availability} />
          <h3 className="line-clamp-2 min-h-12 max-w-full break-words text-lg font-bold leading-snug tracking-tight sm:min-h-0 sm:text-2xl">
            {service.name}
          </h3>
        </div>
        <p className="mt-3 hidden text-sm text-muted sm:block">
          {truncateDescription(service.description)}
        </p>

        <p className="mb-4 mt-3 text-lg font-black tracking-tight sm:text-2xl md:mb-0 md:mt-5 md:text-3xl">
          {formatRupiah(service.price)}
        </p>

        <dl className="mt-5 hidden space-y-2 text-sm font-semibold md:mb-6 md:block">
          <div className="flex items-start gap-2">
            <Users aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <dt className="sr-only">Kuota</dt>
            <dd>
              {service.quota === null
                ? "Tanpa batas kuota"
                : `${service.remainingQuota ?? "—"} dari ${service.quota} slot tersisa`}
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <dt className="sr-only">Deadline</dt>
            <dd>{formatDeadline(service.deadline)}</dd>
          </div>
          <div className="flex items-start gap-2">
            <TicketCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <dt className="sr-only">Status</dt>
            <dd>{availabilityLabels[service.availability]}</dd>
          </div>
        </dl>

        <Link
          className={buttonStyles({ className: "mt-auto w-full sm:w-fit" })}
          href={`/jasa/${service.slug}`}
        >
          Lihat detail
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
