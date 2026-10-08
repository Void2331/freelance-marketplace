import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-white p-6 sm:p-8">
        <FileText className="h-6 w-6" />

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Terms of Service
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: October 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">
              Using the Platform
            </h2>

            <p className="mt-2">
              Users must provide accurate information and use Freelance
              Marketplace for legitimate professional activities.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Clients and Freelancers
            </h2>

            <p className="mt-2">
              Clients and freelancers are responsible for communicating
              clearly, meeting agreed project requirements, and complying
              with applicable laws and marketplace policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Payments
            </h2>

            <p className="mt-2">
              Payments and project transactions are subject to the
              marketplace payment process and applicable transaction
              policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Disputes
            </h2>

            <p className="mt-2">
              Users should attempt to resolve project issues through the
              marketplace's available communication and dispute
              processes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}