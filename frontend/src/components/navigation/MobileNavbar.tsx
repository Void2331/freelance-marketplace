import { useState } from "react";
import { Bell, Menu, MessageSquare, Search } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { navItems } from "@/components/navigation/navbar";

/*
  The menu's open state is controlled here instead of wrapping things in
  SheetTrigger / SheetClose. Those render real <button> elements, and a
  <button> (or a link) inside another <button> is invalid HTML.

  Controlled state avoids nesting entirely: open with one button, and
  every link simply closes the menu when tapped.
*/
export function MobileNavbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const linkClass =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950";

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 pb-6">
            {/* Search */}
            <div className="flex items-center rounded-full border bg-zinc-50 px-4">
              <Search className="h-4 w-4 text-zinc-500" />

              <input
                type="search"
                placeholder="Search jobs"
                className="h-10 w-full border-0 bg-transparent px-3 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            {/* Primary navigation */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.href}
                  onClick={close}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium transition ${
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

            <div className="h-px bg-zinc-200" />

            {/* Messages & Notifications */}
            <nav className="flex flex-col gap-1">
              <Link
                to="/messages"
                onClick={close}
                className={linkClass}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </Link>

              <Link
                to="/notifications"
                onClick={close}
                className={linkClass}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </Link>
            </nav>

            <div className="h-px bg-zinc-200" />

            {/* Auth actions */}
            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link to="/login" onClick={close}>
                  Log in
                </Link>
              </Button>

              <Button
                asChild
                className="w-full"
              >
                <Link to="/register" onClick={close}>
                  Sign up
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}