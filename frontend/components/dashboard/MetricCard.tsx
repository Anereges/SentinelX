interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'gray' | 'orange' | 'pink' | 'indigo';
  trend?: {
    value: number;
    label: string;
  };
}

const colorClasses = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  green: 'bg-green-500/10 border-green-500/20 text-green-400',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  gray: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
};

export function MetricCard({ title, value, icon, color = 'blue', trend }: MetricCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-80 truncate">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className="p-2 bg-white/5 rounded-lg flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}