interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="text-gray-600 text-sm mb-2">{label}</div>
      <div className="text-3xl mb-1">{value}</div>
      {subtitle && <div className="text-gray-500 text-sm">{subtitle}</div>}
    </div>
  );
}
