import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  Wallet,
} from "lucide-react";

import { Link } from "react-router-dom";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";

import { useMyProjects } from "@/hooks/use-projects";

export default function ClientPayments() {
  const {
    data: projects = [],
  } = useMyProjects();

  const total = projects
    .filter(
      (project) =>
        project.status !== "CANCELLED",
    )
    .reduce(
      (sum, project) =>
        sum + project.totalAmount,
      0,
    );

  const pending = projects
    .filter((project) =>
      [
        "AWAITING_PAYMENT",
        "IN_PROGRESS",
      ].includes(project.status),
    )
    .reduce(
      (sum, project) =>
        sum + project.totalAmount,
      0,
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Payments overview"
        description="Track project funding, spending and payment activity."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <CircleDollarSign className="h-5 w-5" />

          <p className="mt-4 text-sm text-zinc-500">
            Total project value
          </p>

          <p className="mt-1 text-2xl font-semibold">
            NGN{" "}
            {total.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <Wallet className="h-5 w-5" />

          <p className="mt-4 text-sm text-zinc-500">
            Pending / active
          </p>

          <p className="mt-1 text-2xl font-semibold">
            NGN{" "}
            {pending.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <CreditCard className="h-5 w-5" />

          <p className="mt-4 text-sm text-zinc-500">
            Payment method
          </p>

          <p className="mt-1 text-2xl font-semibold">
            Paystack
          </p>
        </div>
      </div>

      <SectionCard
        title="Payment actions"
        className="mt-6"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link to="/client/transactions">
              View transactions

              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
          >
            <Link to="/client/projects">
              Review project milestones

              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
          >
            <Link to="/client/reports">
              <BarChart3 className="h-4 w-4" />

              View reports
            </Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}