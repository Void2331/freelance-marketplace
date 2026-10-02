import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs text-zinc-500">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}