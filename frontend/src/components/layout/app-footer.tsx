import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  HelpCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/features/auth/auth-context";

type FooterLink = {
  label: string;
  href: string;
};

const adminLinks: FooterLink[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    label: "Users",
    href: "/admin/users",
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
  },
  {
    label: "Projects",
    href: "/admin/projects",
  },
  {
    label: "Disputes",
    href: "/admin/disputes",
  },
];

const clientLinks: FooterLink[] = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
  },
  {
    label: "My Jobs",
    href: "/client/jobs",
  },
  {
    label: "Projects",
    href: "/client/projects",
  },
  {
    label: "Messages",
    href: "/messages",
  },
];

const freelancerLinks: FooterLink[] = [
  {
    label: "Dashboard",
    href: "/freelancer/dashboard",
  },
  {
    label: "Find Work",
    href: "/freelancer/jobs",
  },
  {
    label: "Proposals",
    href: "/freelancer/proposals",
  },
  {
    label: "Projects",
    href: "/freelancer/projects",
  },
];
const supportLinks: FooterLink[] = [
  {
    label: "Help Center",
    href: "/help",
  },
  {
    label: "Contact Support",
    href: "/support",
  },
  {
    label: "FAQs",
    href: "/faq",
  },
];

const legalLinks: FooterLink[] = [
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Terms of Service",
    href: "/terms",
  },
  {
    label: "Security",
    href: "/security",
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <Link
      to={link.href}
      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {link.label}

      <ArrowUpRight
        className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        {title}
      </h3>

      <nav
        className="flex flex-col gap-2.5"
        aria-label={title}
      >
        {links.map((link) => (
          <FooterLinkItem
            key={`${title}-${link.href}`}
            link={link}
          />
        ))}
      </nav>
    </div>
  );
}

/* ============================================================
   COMPACT FOOTER
   Used on Admin / Client / Freelancer application pages
============================================================ */

function CompactFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="flex min-h-20 flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Freelance Marketplace. All rights
          reserved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link
            to="/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </Link>

          <Link
            to="/terms"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </Link>

          <Link
            to="/security"
            className="transition-colors hover:text-foreground"
          >
            Security
          </Link>

          <Link
            to="/support"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   FULL FOOTER
   Used only on Public / Landing pages
============================================================ */

function FullFooter() {
  const { user } = useAuth();

  const role = user?.role;

  const roleLinks =
    role === "ADMIN"
      ? adminLinks
      : role === "CLIENT"
        ? clientLinks
        : freelancerLinks;

  const roleTitle =
    role === "ADMIN"
      ? "Admin"
      : role === "CLIENT"
        ? "Workspace"
        : "Freelancer";

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                F
              </span>

              <span>Freelance Marketplace</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              A professional marketplace connecting clients with skilled
              freelancers to build great projects together.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure platform
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                <HelpCircle className="h-3.5 w-3.5" />
                Support available
              </div>
            </div>
          </div>

          {/* Role links */}
          <FooterColumn
            title={roleTitle}
            links={roleLinks}
          />

          {/* Support */}
          <FooterColumn
            title="Support"
            links={supportLinks}
          />

          {/* Legal */}
          <FooterColumn
            title="Legal"
            links={legalLinks}
          />
        </div>

        <div className="my-8 border-t" />

        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Freelance Marketplace. All rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>

            <Link
              to="/security"
              className="transition-colors hover:text-foreground"
            >
              Security
            </Link>

            <Link
              to="/support"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   APP FOOTER
============================================================ */

export function AppFooter({
  variant = "compact",
}: {
  variant?: "full" | "compact";
}) {
  if (variant === "full") {
    return <FullFooter />;
  }

  return <CompactFooter />;
}