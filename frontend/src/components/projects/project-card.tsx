import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { Project } from "@/types/project";

import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({
  project,
}: ProjectCardProps) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-zinc-400">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to={`/projects/${project._id}`}
            className="font-semibold hover:underline"
          >
            {project.title}
          </Link>

          <p className="mt-2 text-sm text-zinc-500">
            {project.description ||
              "No project description."}
          </p>
        </div>

        <ArrowUpRight className="h-4 w-4 text-zinc-400" />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-zinc-100 px-3 py-1">
          {project.currency}{" "}
          {project.totalAmount.toLocaleString()}
        </span>

        <span className="rounded-full bg-zinc-100 px-3 py-1">
          {project.status.replaceAll(
            "_",
            " ",
          )}
        </span>
      </div>

      <div className="mt-5">
        <Button
          size="sm"
          asChild
        >
          <Link
            to={`/projects/${project._id}`}
          >
            Open Project
          </Link>
        </Button>
      </div>
    </article>
  );
}