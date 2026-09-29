import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  DollarSign,
  FileText,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SectionCard } from "@/components/dashboard/section-card";
import { ActivityItem } from "@/components/dashboard/activity-item";

const recentProjects = [
  {
    id: "1",
    title: "E-commerce Dashboard",
    client: "Acme Technologies",
    freelancer: "John Developer",
    amount: "₦750,000",
    status: "IN_PROGRESS",
  },
  {
    id: "2",
    title: "Banking API",
    client: "FinTech Ltd",
    freelancer: "Sarah Developer",
    amount: "₦1.2M",
    status: "IN_PROGRESS",
  },
  {
    id: "3",
    title: "Marketing Website",
    client: "Creative Studio",
    freelancer: "Michael Designer",
    amount: "₦450,000",
    status: "COMPLETED",
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Admin Dashboard"
        description="Monitor marketplace activity and platform performance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value="2,481"
          icon={Users}
          trend="+8.4%"
          description="this month"
        />

        <StatCard
          title="Active Jobs"
          value="384"
          icon={BriefcaseBusiness}
          description="currently open"
        />

        <StatCard
          title="Active Projects"
          value="167"
          icon={FileText}
          description="in progress"
        />

        <StatCard
          title="Platform Revenue"
          value="₦18.4M"
          icon={DollarSign}
          trend="+14.6%"
          description="this month"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard
          title="Recent Projects"
          description="Latest marketplace projects"
          action={
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/admin/projects">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-zinc-500">
                  <th className="pb-3 font-medium">
                    Project
                  </th>

                  <th className="pb-3 font-medium">
                    Client
                  </th>

                  <th className="pb-3 font-medium">
                    Freelancer
                  </th>

                  <th className="pb-3 font-medium">
                    Amount
                  </th>

                  <th className="pb-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentProjects.map(
                  (project) => (
                    <tr
                      key={project.id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4 font-medium">
                        {project.title}
                      </td>

                      <td className="py-4 text-zinc-500">
                        {project.client}
                      </td>

                      <td className="py-4 text-zinc-500">
                        {project.freelancer}
                      </td>

                      <td className="py-4 font-medium">
                        {project.amount}
                      </td>

                      <td className="py-4">
                        <StatusBadge
                          status={project.status}
                        />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Platform Health"
          description="Current marketplace status"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="font-medium">
                  Platform Status
                </p>

                <p className="text-xs text-green-600">
                  All systems operational
                </p>
              </div>
            </div>

            <div className="border-t pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">
                  Verified users
                </span>

                <span className="font-semibold">
                  94.2%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-zinc-100">
                <div className="h-full w-[94%] rounded-full bg-zinc-900" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">
                  Jobs successfully completed
                </span>

                <span className="font-semibold">
                  87.6%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-zinc-100">
                <div className="h-full w-[88%] rounded-full bg-zinc-900" />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="User Growth"
          description="Marketplace user activity"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-zinc-50 p-4">
              <UserPlus className="h-5 w-5" />

              <p className="mt-3 text-2xl font-bold">
                128
              </p>

              <p className="text-xs text-zinc-500">
                New users
              </p>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4">
              <Users className="h-5 w-5" />

              <p className="mt-3 text-2xl font-bold">
                82
              </p>

              <p className="text-xs text-zinc-500">
                Freelancers
              </p>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4">
              <BriefcaseBusiness className="h-5 w-5" />

              <p className="mt-3 text-2xl font-bold">
                46
              </p>

              <p className="text-xs text-zinc-500">
                Clients
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          description="Latest platform events"
        >
          <div className="space-y-5">
            <ActivityItem
              icon={UserPlus}
              title="New freelancer registered"
              description="Account verification pending"
              time="10m"
            />

            <ActivityItem
              icon={CheckCircle2}
              title="Project completed"
              description="Marketing Website"
              time="1h"
            />

            <ActivityItem
              icon={DollarSign}
              title="Payment released"
              description="E-commerce Dashboard"
              time="3h"
            />

            <ActivityItem
              icon={BriefcaseBusiness}
              title="New job posted"
              description="Mobile application development"
              time="5h"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}