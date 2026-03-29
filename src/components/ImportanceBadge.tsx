const colors: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-green-100 text-green-800",
};

export default function ImportanceBadge({ importance }: { importance: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors[importance] ?? "bg-gray-100 text-gray-800"}`}
    >
      {importance}
    </span>
  );
}
