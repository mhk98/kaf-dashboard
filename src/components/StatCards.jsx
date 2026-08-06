import { Clock, ShoppingCart, Users, UserCheck } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('en-BD');

export default function StatCards({ summary = {}, loading }) {
  const stats = [
    {
      label: 'Sales Amount',
      value: loading ? '—' : `৳ ${fmt(summary.totalSales)}`,
      icon: Clock,
      tone: 'bg-gray-900 text-white',
    },
    {
      label: 'Total Order',
      value: loading ? '—' : fmt(summary.totalOrders),
      icon: ShoppingCart,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Visitors',
      value: loading ? '—' : fmt(summary.totalVisitors),
      icon: Users,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Customers',
      value: loading ? '—' : fmt(summary.totalCustomers),
      icon: UserCheck,
      tone: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div>
            <div className={`text-xl font-bold text-gray-900 ${loading ? 'animate-pulse' : ''}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
          <div className={`rounded-lg p-2 ${s.tone}`}>
            <s.icon size={28} />
          </div>
        </div>
      ))}
    </div>
  );
}
