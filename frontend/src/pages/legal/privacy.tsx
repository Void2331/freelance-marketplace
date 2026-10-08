import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-white p-6 sm:p-8">
        <ShieldCheck className="h-6 w-6" />

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: October 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">
              Information We Collect
            </h2>

            <p className="mt-2">
              Freelance Marketplace may collect information required to
              create and operate user accounts, facilitate projects,
              communicate with other users, and process transactions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              How We Use Information
            </h2>

            <p className="mt-2">
              Information may be used to provide marketplace services,
              maintain account security, process transactions, support
              users, and improve the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Account Security
            </h2>

            <p className="mt-2">
              Users are responsible for maintaining the confidentiality
              of their account credentials. Never share your password or
              authentication tokens with another person.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Contact
            </h2>

            <p className="mt-2">
              If you have questions about privacy or your personal
              information, please contact the marketplace support team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}