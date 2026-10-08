import {
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

const helpItems = [
  {
    title: "Getting Started",
    description:
      "Learn how to create your profile, find opportunities, post jobs, and start working on projects.",
    icon: BookOpen,
  },
  {
    title: "Jobs & Proposals",
    description:
      "Understand how clients post jobs and how freelancers can submit and manage proposals.",
    icon: FileText,
  },
  {
    title: "Messages",
    description:
      "Communicate with clients and freelancers through the marketplace messaging system.",
    icon: MessageSquare,
  },
  {
    title: "Payments",
    description:
      "Learn about payments, transactions, project milestones, and earnings.",
    icon: ShieldCheck,
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <HelpCircle className="h-6 w-6" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Help Center
        </h1>

        <p className="mt-3 text-muted-foreground">
          Find answers and helpful information about using Freelance
          Marketplace.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {helpItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border bg-white p-6 transition-shadow hover:shadow-sm"
            >
              <Icon className="h-5 w-5 text-zinc-700" />

              <h2 className="mt-4 font-semibold">{item.title}</h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}