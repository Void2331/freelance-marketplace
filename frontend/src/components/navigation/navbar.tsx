import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Menu,
  MessageSquare,
  Search,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  {
    id: "find-work",
    label: "Find Work",
    href: "/jobs",
  },
  {
    id: "find-talent",
    label: "Find Talent",
    href: "/freelancers",
  },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            FreelanceHub
          </span>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? "text-zinc-950"
                    : "text-zinc-600 hover:text-zinc-950"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden flex-1 md:block">
          <div className="mx-auto flex max-w-md items-center rounded-full border bg-zinc-50 px-4">
            <Search className="h-4 w-4 text-zinc-500" />

            <input
              type="search"
              placeholder="Search jobs..."
              className="h-10 w-full border-0 bg-transparent px-3 text-sm outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Messages */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
          >
            <Link
              to="/messages"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>
          </Button>

          {/* Notifications */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
          >
            <Link
              to="/notifications"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          {/* Login */}
          <Link
            to="/login"
            className="hidden text-sm font-medium text-zinc-700 mr-1 hover:text-zinc-950 sm:block"
          >
            Log in
          </Link>

          {/* Sign up */}
          <Button asChild>
            <Link to="/register">
              Sign up
            </Link>
          </Button>

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Profile */}
     <Link
  to="/settings/profile"
  aria-label="Profile"
  className="hidden h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 md:inline-flex"
>
  <UserRound className="h-5 w-5" />
</Link>

        </div>
      </div>
    </header>
  );
}