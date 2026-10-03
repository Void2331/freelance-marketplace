import { Bell, Menu, MessageSquare, Search } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "@/components/navigation/navbar";

export function MobileNavbar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-6">
          {/* ── Search ─────────────────────────────── */}
          <div className="flex items-center rounded-full border bg-zinc-50 px-4">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              type="search"
              placeholder="Search jobs"
              className="h-10 w-full border-0 bg-transparent px-3 text-sm outline-none placeholder:text-zinc-500"
            />
          </div>

          {/* ── Primary nav ────────────────────────── */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <SheetClose asChild key={item.id}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </SheetClose>
            ))}
          </nav>

          <div className="h-px bg-zinc-200" />

          {/* ── Messages & Notifications ───────────── */}
          <nav className="flex flex-col gap-1">
            <SheetClose asChild>
              <Link
                to="/messages"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
                {/* Optional unread badge */}
                {/* <span className="ml-auto rounded-full bg-zinc-950 px-2 py-0.5 text-xs font-semibold text-white">
                  3
                </span> */}
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                to="/notifications"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
                {/* <span className="ml-auto rounded-full bg-zinc-950 px-2 py-0.5 text-xs font-semibold text-white">
                  5
                </span> */}
              </Link>
            </SheetClose>
          </nav>

          <div className="h-px bg-zinc-200" />

          {/* ── Auth actions ───────────────────────── */}
          <div className="flex flex-col gap-2">
            <SheetClose asChild>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login" className="justify-center">
                  Log in
                </Link>
              </Button>
            </SheetClose>

            <SheetClose asChild>
              <Button asChild className="w-full">
                <Link to="/register" className="justify-center">
                  Sign up
                </Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}