import { ArrowUpRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, DollarSign, FileText } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { useMyContracts } from "@/hooks/use-contracts";

function money(amount?: number) { return `₦${(amount ?? 0).toLocaleString()}`; }
function formatDate(date?: string | null) {
  if (!date) return "Not started";
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function FreelancerContractsPage() {
  const { data: contracts = [], isLoading, isError } = useMyContracts();

  const active = contracts.filter((contract) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(contract.status));
  const completed = contracts.filter((contract) => contract.status === "COMPLETED");
  const totalValue = contracts.reduce((sum, contract) => sum + (contract.proposal?.bidAmount ?? 0), 0);

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <DashboardHeader title="Contracts" description="Manage your active and completed freelance contracts." action={<Button asChild><Link to="/freelancer/projects">My Projects</Link></Button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Contracts" value={isLoading ? "—" : contracts.length} icon={FileText} description="all contracts" />
        <StatCard title="Active" value={isLoading ? "—" : active.length} icon={Clock3} description="currently active" />
        <StatCard title="Completed" value={isLoading ? "—" : completed.length} icon={CheckCircle2} description="successfully delivered" />
        <StatCard title="Contract Value" value={isLoading ? "—" : `NGN ${totalValue.toLocaleString()}`} icon={DollarSign} description="total agreed value" />
      </div>

      <SectionCard title="Your contracts" description="Open a contract to enter its project workroom" className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-56 animate-pulse rounded-xl bg-zinc-100" />)}</div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Unable to load your contracts. Please try again.</div>
        ) : contracts.length === 0 ? (
          <EmptyState icon={FileText} title="No contracts yet" description="When a client hires you and your project moves into a contract, it will appear here." actionLabel="Find work" onAction={() => { window.location.href = "/freelancer/jobs"; }} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {contracts.map((contract) => {
              const projectTitle = contract.project?.job?.title ?? contract.project?.title ?? "Freelance project";
              const amount = contract.proposal?.bidAmount;
              return (
                <article key={contract._id} className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm transition hover:border-zinc-400 hover:shadow-md sm:p-6">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100"><BriefcaseBusiness className="h-5 w-5 text-zinc-700" /></div>
                      <h2 className="break-words text-base font-semibold sm:text-lg">{projectTitle}</h2>
                      <p className="mt-1 text-sm text-zinc-500">Client: {contract.client?.name}</p>
                    </div>
                    <StatusBadge status={contract.status} />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-zinc-50 p-4"><div className="flex items-center gap-2 text-xs text-zinc-500"><DollarSign className="h-4 w-4" />Contract value</div><p className="mt-1 text-lg font-semibold">{money(amount)}</p></div>
                    <div className="rounded-xl bg-zinc-50 p-4"><div className="flex items-center gap-2 text-xs text-zinc-500"><CalendarDays className="h-4 w-4" />Started</div><p className="mt-1 text-sm font-semibold">{formatDate(contract.startedAt)}</p></div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-zinc-500">Created {formatDate(contract.createdAt)}</div>
                    <Button asChild><Link to={`/projects/${contract.project._id}`}>Open workroom <ArrowUpRight className="h-4 w-4" /></Link></Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
