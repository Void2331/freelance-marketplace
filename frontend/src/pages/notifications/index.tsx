export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Notifications
        </h1>

        <p className="text-sm text-zinc-600">
          View your latest notifications.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">
          No notifications yet.
        </p>
      </div>
    </div>
  );
}