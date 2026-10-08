import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { MessagesButton } from "@/components/layout/messages-button";

import { useAuth } from "@/features/auth/auth-context";

interface NavigationLink {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavigationItem {
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
  items?: NavigationLink[];
}

function getNavigation(role: string): NavigationItem[] {
  if (role === "CLIENT") {
    return [
      {
        label: "Home",
        href: "/client/dashboard",
        icon: LayoutDashboard,
      },

      {
        label: "Find Freelancers",
        href: "/freelancers",
        icon: Search,
      },

      {
        label: "Jobs",
        icon: BriefcaseBusiness,
        items: [
          {
            label: "My Jobs",
            href: "/client/jobs",
            icon: BriefcaseBusiness,
          },
          {
            label: "Post a Job",
            href: "/client/jobs/new",
            icon: FileText,
          },
        ],
      },

      {
        label: "Proposals",
        href: "/client/proposals",
        icon: FileText,
      },

      {
        label: "Contracts & Projects",
        icon: FolderKanban,
        items: [
          {
            label: "Active Projects",
            href: "/client/projects",
            icon: FolderKanban,
          },
          {
            label: "All Projects",
            href: "/client/projects",
            icon: FolderKanban,
          },
        ],
      },

      {
        label: "Messages",
        href: "/messages",
        icon: MessageSquare,
      },

      {
        label: "Payments",
        icon: CircleDollarSign,
        items: [
          {
            label: "Payment Overview",
            href: "/client/payments",
            icon: CircleDollarSign,
          },
          {
            label: "Transactions",
            href: "/client/transactions",
            icon: FileText,
          },
          {
            label: "Reports",
            href: "/client/reports",
            icon: FileText,
          },
        ],
      },

      {
        label: "Settings",
        href: "/settings/profile",
        icon: Settings,
      },
    ];
  }

  if (role === "FREELANCER") {
    return [
      {
        label: "Home",
        href: "/freelancer/dashboard",
        icon: LayoutDashboard,
      },

      {
        label: "Find Work",
        href: "/freelancer/jobs",
        icon: Search,
      },

      {
        label: "Proposals",
        href: "/freelancer/proposals",
        icon: FileText,
      },

      {
        label: "Projects",
        href: "/freelancer/projects",
        icon: BriefcaseBusiness,
      },

      {
        label: "Contracts",
        href: "/freelancer/contracts",
        icon: FileText,
      },

      {
        label: "Finances",
        href: "/freelancer/finances",
        icon: Wallet,
      },
    ];
  }

  return [
    {
      label: "Home",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "Users",
      href: "/admin/users",
      icon: UserRound,
    },

    {
      label: "Jobs",
      href: "/admin/jobs",
      icon: BriefcaseBusiness,
    },

    {
      label: "Projects",
      href: "/admin/projects",
      icon: FolderKanban,
    },

    {
      label: "Disputes",
      href: "/admin/disputes",
      icon: AlertTriangle,
    },

    {
      label: "Finance",
      href: "/admin/finance",
      icon: Wallet,
    },
  ];
}

function NavigationLinks({
  navigation,
  onNavigate,
  mobile = false,
}: {
  navigation: NavigationItem[];
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  function renderLink(item: NavigationLink, nested = false) {
    const Icon = item.icon;

    return (
      <NavLink
        key={`${item.label}-${item.href}`}
        to={item.href}
        end={item.href.endsWith("dashboard")}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 text-sm font-medium transition-colors ${
            mobile ? "rounded-xl py-3" : "rounded-lg py-2.5"
          } ${nested ? "ml-4" : ""} ${
            isActive
              ? "bg-zinc-950 text-white"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
          }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" />

        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        if (item.items?.length) {
          const GroupIcon = item.icon;

          return (
            <div key={item.label} className="space-y-1 pt-2">
              <div className="flex items-center gap-3 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <GroupIcon className="h-4 w-4 shrink-0" />

                <span>{item.label}</span>
              </div>

              {item.items.map((child) =>
                renderLink(child, true),
              )}
            </div>
          );
        }

        if (!item.href) return null;

        return renderLink({
          label: item.label,
          href: item.href,
          icon: item.icon,
        });
      })}
    </nav>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = getNavigation(user?.role ?? "CLIENT");

  /*
   * Prevent the page behind the drawer from scrolling
   * while the mobile navigation is open.
   */
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /*
   * Allow the Escape key to close the drawer.
   */
  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    setMobileMenuOpen(false);
    await logout();
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* =========================================================
          DESKTOP / MOBILE HEADER
      ========================================================= */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <span className="hidden font-bold sm:block">
              FreelanceHub
            </span>
          </Link>

          {/* =====================================================
              DESKTOP TOP NAVIGATION
          ===================================================== */}
          <nav className="ml-8 hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const href = item.href ?? item.items?.[0]?.href;

              if (!href) return null;

              return (
                <NavLink
                  key={item.label}
                  to={href}
                  end={href.endsWith("dashboard")}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />

                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* =====================================================
              RIGHT SIDE ACTIONS
          ===================================================== */}
          <div className="ml-auto flex items-center gap-1">
            {/* Messages */}
            <MessagesButton />

            {/* Notifications */}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Bell className="h-5 w-5" />
            </Link>

            {/* Settings */}
            <Link
              to="/settings/profile"
              aria-label="Settings"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 sm:inline-flex"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {/* Profile */}
            <Link
              to="/settings/profile"
              className="ml-1 hidden items-center gap-3 border-l pl-4 transition-opacity hover:opacity-80 sm:flex"
              aria-label="Profile settings"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                {user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
              </div>

              <div className="hidden xl:block">
                <p className="max-w-32 truncate text-sm font-semibold">
                  {user?.name}
                </p>

                <p className="text-xs text-zinc-500">
                  {user?.role}
                </p>
              </div>
            </Link>

            {/* Desktop logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
              className="hidden sm:inline-flex"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* ===================================================
                MOBILE MENU BUTTON
            =================================================== */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE NAVIGATION DRAWER
      ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>

                <span className="font-bold">
                  FreelanceHub
                </span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User profile */}
            <div className="border-b px-4 py-5">
              <Link
                to="/settings/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {user?.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950">
                    {user?.name ?? "User"}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {user?.role}
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Navigation
              </p>

              <NavigationLinks
                navigation={navigation}
                mobile
                onNavigate={() => setMobileMenuOpen(false)}
              />

              <div className="my-5 border-t" />

              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Account
              </p>

              <nav className="space-y-1">
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <MessageSquare className="h-4 w-4" />

                  <span>Messages</span>
                </Link>

                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Bell className="h-4 w-4" />

                  <span>Notifications</span>
                </Link>

                <Link
                  to="/settings/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Settings className="h-4 w-4" />

                  <span>Settings</span>
                </Link>
              </nav>
            </div>

            {/* Logout */}
            <div className="border-t p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />

                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================
          DESKTOP SIDEBAR + PAGE CONTENT + COMPACT FOOTER
      ========================================================= */}
      <div className="flex min-h-[calc(100vh-4rem)] flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-white p-4 lg:block">
          <NavigationLinks navigation={navigation} />
        </aside>

        {/* Main content */}
       <main className="flex min-w-0 flex-1 flex-col">
  <div className="flex-1">
    <Outlet />
  </div>
</main>
      </div>
    </div>
  );
}