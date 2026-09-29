export default function Messages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Messages
        </h1>

        <p className="text-sm text-zinc-600">
          View and manage your conversations.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">
          No messages yet.
        </p>
      </div>
    </div>
  );
}