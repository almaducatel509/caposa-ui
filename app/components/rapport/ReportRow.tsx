// components/reports/ReportRow.tsx
export function ReportRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={highlight ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

export function ReportDivider() {
  return <hr className="my-2 border-gray-200" />;
}
