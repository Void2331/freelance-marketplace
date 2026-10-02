import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

import { useAuth } from "@/features/auth/auth-context";
import { useAllUsers, useUpdateUserStatus } from "@/hooks/use-users";
import { getErrorMessage } from "@/lib/errors";
import type { User } from "@/types/user";

const ROLE_FILTERS = [
  { value: "", label: "All" },
  { value: "CLIENT", label: "Clients" },
  { value: "FREELANCER", label: "Freelancers" },
  { value: "ADMIN", label: "Admins" },
];

function UserRow({ user }: { user: User }) {
  const { user: currentUser } = useAuth();
  const updateStatus = useUpdateUserStatus();

  const isSelf = user._id === currentUser?._id;
  const isActive = user.isActive !== false;

  async function handleToggle() {
    const confirmed = window.confirm(
      isActive
        ? `Deactivate ${user.name}? They won't be able to sign in until reactivated.`
        : `Reactivate ${user.name}?`,
    );

    if (!confirmed) return;

    try {
      await updateStatus.mutateAsync({ id: user._id, isActive: !isActive });
      toast.success(isActive ? "User deactivated" : "User reactivated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update user status"));
    }
  }

  return (
    <tr>
      <td className="px-5 py-3 font-medium">{user.name}</td>
      <td className="px-5 py-3 text-zinc-500">{user.email}</td>
      <td className="px-5 py-3">{user.role}</td>
      <td className="px-5 py-3">{user.isEmailVerified ? "Yes" : "No"}</td>
      <td className="px-5 py-3 text-zinc-500">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
      </td>
      <td className="px-5 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-zinc-200 text-zinc-600"
          }`}
        >
          {isActive ? "Active" : "Deactivated"}
        </span>
      </td>
      <td className="px-5 py-3 text-right">
        {user.role !== "ADMIN" && !isSelf && (
          <Button
            size="sm"
            variant={isActive ? "outline" : "default"}
            onClick={handleToggle}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isActive ? "Deactivate" : "Reactivate"}
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAllUsers({
    role: role || undefined,
    search: search.trim() || undefined,
    page,
    limit: 25,
  });

  const users = data?.users ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardHeader
        title="Users"
        description="Everyone registered on the platform."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          className="max-w-sm"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        <div className="flex gap-2">
          {ROLE_FILTERS.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={role === item.value ? "default" : "outline"}
              onClick={() => {
                setRole(item.value);
                setPage(1);
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Verified</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-red-600">
                  Unable to load users.
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-zinc-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow key={user._id} user={user} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
