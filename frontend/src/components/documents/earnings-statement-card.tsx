import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/dashboard/section-card";

import {
  downloadEarningsStatement,
  downloadErrorMessage,
} from "@/services/documents";

const pad = (value: number) => String(value).padStart(2, "0");

function toInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function presets() {
  const now = new Date();
  const year = now.getFullYear();

  return [
    { label: "This year", from: new Date(year, 0, 1), to: now },
    { label: "Last year", from: new Date(year - 1, 0, 1), to: new Date(year - 1, 11, 31) },
    { label: "Last 3 months", from: new Date(year, now.getMonth() - 3, now.getDate()), to: now },
  ];
}

export function EarningsStatementCard() {
  const [from, setFrom] = useState(() => toInput(new Date(new Date().getFullYear(), 0, 1)));
  const [to, setTo] = useState(() => toInput(new Date()));
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!from || !to) {
      toast.error("Choose a start and end date");
      return;
    }

    if (from > to) {
      toast.error("The start date must be before the end date");
      return;
    }

    setLoading(true);

    try {
      await downloadEarningsStatement(from, to);
    } catch (error) {
      toast.error(await downloadErrorMessage(error, "Unable to download the statement"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Earnings statement"
      description="A PDF of everything you earned in a period. Useful as proof of income."
    >
      <div className="flex flex-wrap gap-2">
        {presets().map((preset) => (
          <Button
            key={preset.label}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setFrom(toInput(preset.from));
              setTo(toInput(preset.to));
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          From
          <Input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="mt-1"
          />
        </label>

        <label className="text-sm font-medium">
          To
          <Input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="mt-1"
          />
        </label>
      </div>

      <Button
        type="button"
        className="mt-4"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download PDF
      </Button>

      <p className="mt-3 text-xs text-zinc-500">
        Shows what was credited to your wallet after platform fees, by the day
        each payment was released.
      </p>
    </SectionCard>
  );
}
