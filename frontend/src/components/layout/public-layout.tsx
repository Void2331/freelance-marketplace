import { Link, Outlet } from "react-router-dom";
import {
  BriefcaseBusiness,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* =========================================================
          PUBLIC NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <span className="font-bold text-zinc-950">
              FreelanceHub
            </span>
          </Link>

          {/* =====================================================
              DESKTOP NAVIGATION
          ===================================================== */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Find Work */}
            <Link
              to="/jobs"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              Find Work
            </Link>

            {/* Find Talent */}
            <Link
              to="/freelancers"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              Find Talent
            </Link>

            {/* Search Jobs */}
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Search className="h-4 w-4" />
              <span>Search Jobs</span>
            </Link>
          </nav>

          {/* =====================================================
              AUTH ACTIONS
          ===================================================== */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Sign Up
            </Link>
          </div>

          {/* =====================================================
              MOBILE MENU BUTTON
          ===================================================== */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden"
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
          </button>
        </div>

        {/* =======================================================
            MOBILE NAVIGATION
        ======================================================= */}
        {mobileMenuOpen && (
          <div className="border-t bg-white md:hidden">
            <nav className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 px-4 py-4 sm:px-6">
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Find Work
              </Link>

              <Link
                to="/freelancers"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Find Talent
              </Link>

              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                <Search className="h-4 w-4" />
                Search Jobs
              </Link>

              <div className="my-2 border-t" />

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-zinc-950 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* =========================================================
          PUBLIC PAGE CONTENT
      ========================================================= */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}