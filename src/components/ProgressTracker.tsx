import { Badge } from "./Badge";

type Item = { label: string; done: boolean };

export function ProgressTracker({ items }: { items: Item[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
          <span className="text-sm text-slate-700">{item.label}</span>
          <Badge tone={item.done ? "green" : "orange"}>{item.done ? "Done" : "Pending"}</Badge>
        </div>
      ))}
    </div>
  );
}
