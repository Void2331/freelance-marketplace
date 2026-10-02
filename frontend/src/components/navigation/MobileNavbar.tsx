import { Menu, Search } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "@/components/navigation/navbar"; // adjust path if you moved navItems

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

      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          {/* Search — same styling as desktop, full width */}
          <div className="flex items-center rounded-full border bg-zinc-50 px-4">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              type="search"
              placeholder="Search jobs..."
              className="h-10 w-full border-0 bg-transparent px-3 text-sm outline-none placeholder:text-zinc-500"
            />
          </div>

          {/* Nav items */}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}