import {
  FolderKanban,
} from "lucide-react";

import {
  DashboardHeader,
} from "@/components/dashboard/dashboard-header";

import {
  EmptyState,
} from "@/components/dashboard/empty-state";

import {
  ProjectCard,
} from "@/components/projects/project-card";

import {
  useMyProjects,
} from "@/hooks/use-projects";

export default function ClientProjectsPage() {
  const {
    data: projects = [],
    isLoading,
    isError,
  } = useMyProjects();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="My Projects"
        description="Manage projects you've hired freelancers to complete."
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-xl bg-zinc-100"
              />
            ),
          )}
        </div>
      ) : isError ? (
        <div className="rounded-xl border p-10 text-center">
          Unable to load projects.
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border bg-white">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Projects will appear here after you accept a freelancer proposal."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map(
            (project) => (
              <ProjectCard
                key={project._id}
                project={project}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}