import { Mail, MessageSquare, ShieldCheck } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-white p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <MessageSquare className="h-6 w-6" />
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Contact Support
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Need help with your account, project, payment, or another
          marketplace issue? Our support team is here to help.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-5">
            <Mail className="h-5 w-5" />

            <h2 className="mt-3 font-semibold">Email Support</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Send us a detailed description of your issue and our team
              will review it.
            </p>

            <a
              href="mailto:support@freelancemarketplace.com"
              className="mt-4 inline-flex text-sm font-medium hover:underline"
            >
              support@freelancemarketplace.com
            </a>
          </div>

          <div className="rounded-xl border p-5">
            <ShieldCheck className="h-5 w-5" />

            <h2 className="mt-3 font-semibold">Account & Security</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              For account security concerns, include as much relevant
              information as possible without sharing your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}