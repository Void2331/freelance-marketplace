import {
  Bell,
  BriefcaseBusiness,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserRound,
} from "lucide-react";
import {
  Link,
  NavLink,
  Outlet,
} from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";

function getNavigation(
  role: string,
) {
  if (role === "CLIENT") {
    return [
      {
        label: "Dashboard",
        href: "/client/dashboard",
      },
      {
        label: "My Jobs",
        href: "/client/jobs",
      },
      {
        label: "Proposals",
        href: "/client/proposals",
      },
      {
        label: "Projects",
        href: "/client/projects",
      },
    ];
  }

  if (role === "FREELANCER") {
    return [
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
  }

  return [
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
  ];
}

export default function AppLayout() {
  const { user, logout } = useAuth();

  const navigation = getNavigation(
    user?.role ?? "CLIENT",
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <span className="hidden font-bold sm:block">
              FreelanceHub
            </span>
          </Link>

          <nav className="ml-8 hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
  to="/messages"
  aria-label="Messages"
  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
>
  <MessageSquare className="h-5 w-5" />
</Link>

       <Link
  to="/notifications"
  aria-label="Notifications"
  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
>
  <Bell className="h-5 w-5" />
</Link>

            <Link
  to="/settings/profile"
  aria-label="Settings"
  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
>
  <Settings className="h-5 w-5" />
</Link>

    <Link
  to="/settings/profile"
  className="ml-2 hidden items-center gap-3 border-l pl-4 transition-opacity hover:opacity-80 sm:flex"
  aria-label="Profile settings"
>
  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
    {user?.name?.charAt(0).toUpperCase() ?? (
      <UserRound className="h-4 w-4" />
    )}
  </div>

  <div className="hidden xl:block">
    <p className="text-sm font-semibold">
      {user?.name}
    </p>

    <p className="text-xs text-zinc-500">
      {user?.role}
    </p>
  </div>
</Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-4rem)] w-64 border-r bg-white p-4 lg:block">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}