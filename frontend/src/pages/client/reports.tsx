import {
  BarChart3,
  Download,
  FileText,
} from "lucide-react";
import { useMemo } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";

import { useMyJobs } from "@/hooks/use-jobs";
import { useMyProjects } from "@/hooks/use-projects";
import { useClientProposals } from "@/hooks/use-proposals";

export default function ClientReports() {
  const { data: jobs = [] } = useMyJobs();
  const { data: projects = [] } = useMyProjects();
  const { data: proposals = [] } =
    useClientProposals();

  const metrics = useMemo(() => {
    const completed = projects.filter(
      (project) =>
        project.status === "COMPLETED",
    );

    const cancelled = projects.filter(
      (project) =>
        project.status === "CANCELLED",
    );

    const totalValue = projects
      .filter(
        (project) =>
          project.status !== "CANCELLED",
      )
      .reduce(
        (sum, project) =>
          sum + project.totalAmount,
        0,
      );

    return {
      totalJobs: jobs.length,

      totalProposals:
        proposals.length,

      activeProjects:
        projects.filter((project) =>
          [
            "AWAITING_PAYMENT",
            "IN_PROGRESS",
          ].includes(project.status),
        ).length,

      completedProjects:
        completed.length,

      cancelledProjects:
        cancelled.length,

      totalValue,

      completionRate: projects.length
        ? Math.round(
            (completed.length /
              projects.length) *
              100,
          )
        : 0,
    };
  }, [
    jobs,
    projects,
    proposals,
  ]);

  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      [
        "Total jobs",
        String(metrics.totalJobs),
      ],
      [
        "Total proposals",
        String(metrics.totalProposals),
      ],
      [
        "Active projects",
        String(metrics.activeProjects),
      ],
      [
        "Completed projects",
        String(
          metrics.completedProjects,
        ),
      ],
      [
        "Cancelled projects",
        String(
          metrics.cancelledProjects,
        ),
      ],
      [
        "Total project value",
        String(metrics.totalValue),
      ],
      [
        "Completion rate",
        `${metrics.completionRate}%`,
      ],
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${cell.replaceAll(
                '"',
                '""',
              )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "client-report.csv";

    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="My reports"
        description="Review hiring activity, project performance and spending."
        action={
          <Button
            variant="outline"
            onClick={exportReport}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <FileText className="h-5 w-5 text-zinc-500" />

          <p className="mt-4 text-sm text-zinc-500">
            Jobs posted
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {metrics.totalJobs}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <BarChart3 className="h-5 w-5 text-zinc-500" />

          <p className="mt-4 text-sm text-zinc-500">
            Proposals received
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {metrics.totalProposals}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <BarChart3 className="h-5 w-5 text-zinc-500" />

          <p className="mt-4 text-sm text-zinc-500">
            Completion rate
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {metrics.completionRate}%
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <BarChart3 className="h-5 w-5 text-zinc-500" />

          <p className="mt-4 text-sm text-zinc-500">
            Project value
          </p>

          <p className="mt-1 text-2xl font-semibold">
            NGN{" "}
            {metrics.totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      <SectionCard
        title="Hiring performance"
        description="Your current marketplace activity"
        className="mt-6"
      >
        <div className="divide-y">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">
                Active projects
              </p>

              <p className="text-xs text-zinc-500">
                Projects currently being delivered
              </p>
            </div>

            <p className="font-semibold">
              {metrics.activeProjects}
            </p>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">
                Completed projects
              </p>

              <p className="text-xs text-zinc-500">
                Successfully completed work
              </p>
            </div>

            <p className="font-semibold">
              {metrics.completedProjects}
            </p>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">
                Cancelled projects
              </p>

              <p className="text-xs text-zinc-500">
                Projects that were cancelled
              </p>
            </div>

            <p className="font-semibold">
              {metrics.cancelledProjects}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}