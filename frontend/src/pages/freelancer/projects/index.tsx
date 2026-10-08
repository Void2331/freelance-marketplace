import { ArrowUpRight, CheckCircle2, Clock3, FolderKanban, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProjectCard } from "@/components/projects/project-card";
import { useMyProjects } from "@/hooks/use-projects";

export default function FreelancerProjectsPage() {
  const { data: projects = [], isLoading, isError } = useMyProjects();

  const active = projects.filter((project) => ["AWAITING_PAYMENT", "IN_PROGRESS"].includes(project.status));
  const completed = projects.filter((project) => project.status === "COMPLETED");
  const totalValue = projects.filter((project) => project.status !== "CANCELLED").reduce((sum, project) => sum + project.totalAmount, 0);

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="My Projects"
        description="Manage projects you've been hired to work on, from kickoff to completion."
        action={<Button asChild><Link to="/freelancer/contracts">View Contracts</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="All Projects" value={isLoading ? "—" : projects.length} icon={FolderKanban} description="total projects" />
        <StatCard title="Active" value={isLoading ? "—" : active.length} icon={Clock3} description="currently active" />
        <StatCard title="Completed" value={isLoading ? "—" : completed.length} icon={CheckCircle2} description="successfully delivered" />
        <StatCard title="Project Value" value={isLoading ? "—" : `NGN ${totalValue.toLocaleString()}`} icon={Layers3} description="excluding cancelled" />
      </div>

      <SectionCard
        title="Project workspace"
        description="Open a project to continue working with your client"
        action={<Button variant="ghost" size="sm" asChild><Link to="/freelancer/contracts">Contracts <ArrowUpRight className="h-4 w-4" /></Link></Button>}
        className="mt-6"
      >
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl bg-zinc-100" />)}</div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Unable to load projects. Please try again.</div>
        ) : projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Projects will appear here once a client accepts one of your proposals." actionLabel="Find work" onAction={() => { window.location.href = "/freelancer/jobs"; }} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => <ProjectCard key={project._id} project={project} />)}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
