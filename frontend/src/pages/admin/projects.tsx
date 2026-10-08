import { Link } from "react-router-dom";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  CircleCheck,
  FolderKanban,
  TriangleAlert,
} from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";

import { useAdminProjects } from "@/hooks/use-projects";

export default function AdminProjectsPage() {
  const {
    data: projects = [],
    isLoading,
    isError,
  } = useAdminProjects();

  const active =
    projects.filter(
      (project) =>
        project.status ===
        "IN_PROGRESS",
    ).length;

  const completed =
    projects.filter(
      (project) =>
        project.status ===
        "COMPLETED",
    ).length;

  const disputed =
    projects.filter(
      (project) =>
        project.status ===
        "DISPUTED",
    ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Projects"
        description="Every project on the platform."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Active Projects"
          value={active}
          icon={FolderKanban}
          description="currently in progress"
        />

        <StatCard
          title="Completed"
          value={completed}
          icon={CircleCheck}
          description="successfully delivered"
        />

        <StatCard
          title="Disputed"
          value={disputed}
          icon={TriangleAlert}
          description="may need admin attention"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">
                Project
              </th>

              <th className="px-5 py-3">
                Client
              </th>

              <th className="px-5 py-3">
                Freelancer
              </th>

              <th className="px-5 py-3">
                Value
              </th>

              <th className="px-5 py-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-zinc-400"
                >
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-red-600"
                >
                  Unable to load projects.
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-zinc-400"
                >
                  No projects yet.
                </td>
              </tr>
            ) : (
              projects.map(
                (project) => (
                  <tr
                    key={project._id}
                  >
                    <td className="px-5 py-3 font-medium">
                      <Link
                        to={`/projects/${project._id}`}
                        className="hover:underline"
                      >
                        {project.title}
                      </Link>
                    </td>

                    <td className="px-5 py-3 text-zinc-500">
                      {typeof project.client ===
                      "string"
                        ? "—"
                        : project.client.name}
                    </td>

                    <td className="px-5 py-3 text-zinc-500">
                      {typeof project.freelancer ===
                      "string"
                        ? "—"
                        : project.freelancer.name}
                    </td>

                    <td className="px-5 py-3">
                      {project.currency}{" "}
                      {project.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-5 py-3">
                      <StatusBadge
                        status={
                          project.status
                        }
                      />
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}