import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-base font-semibold text-zinc-950">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-5 text-zinc-500">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      <div className="min-w-0 p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}