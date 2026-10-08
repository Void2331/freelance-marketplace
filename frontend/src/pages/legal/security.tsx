import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-white p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Security
        </h1>

        <p className="mt-3 text-muted-foreground">
          Security is an important part of keeping the Freelance
          Marketplace safe for clients and freelancers.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-5">
            <LockKeyhole className="h-5 w-5" />

            <h2 className="mt-3 font-semibold">
              Account Protection
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Authentication and account controls help protect users and
              their marketplace activity.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <ShieldCheck className="h-5 w-5" />

            <h2 className="mt-3 font-semibold">
              Secure Transactions
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Marketplace payment activity is handled through the
              platform's configured payment infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}