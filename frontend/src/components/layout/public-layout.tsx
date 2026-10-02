import { Link,  Outlet } from "react-router-dom";

import Navbar from "@/components/navigation/navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <footer className="border-t bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="text-lg font-bold">
                FreelanceHub
              </div>

              <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">
                Connect clients with talented freelancers and
                move projects from idea to completion.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                For Clients
              </h3>

              <div className="mt-4 space-y-3 text-sm text-zinc-400">
                <Link
                  to="/jobs"
                  className="block hover:text-white"
                >
                  Browse talent
                </Link>

                <Link
                  to="/register"
                  className="block hover:text-white"
                >
                  Post a job
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                For Freelancers
              </h3>

              <div className="mt-4 space-y-3 text-sm text-zinc-400">
                <Link
                  to="/jobs"
                  className="block hover:text-white"
                >
                  Find work
                </Link>

                <Link
                  to="/register"
                  className="block hover:text-white"
                >
                  Create profile
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Platform
              </h3>

              <div className="mt-4 space-y-3 text-sm text-zinc-400">
                <Link
                  to="/"
                  className="block hover:text-white"
                >
                  About
                </Link>

                <Link
                  to="/"
                  className="block hover:text-white"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-zinc-800 pt-6 text-sm text-zinc-500">
            © {new Date().getFullYear()} FreelanceHub. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}