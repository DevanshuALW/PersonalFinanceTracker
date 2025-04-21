interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  iconColor: string;
  changePercent: number;
  positive: boolean;
}

export default function SummaryCard({ 
  title, 
  amount, 
  icon, 
  iconColor, 
  changePercent, 
  positive 
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className={`p-1.5 ${iconColor} rounded-md`}>
          <i className={icon}></i>
        </span>
      </div>
      <p className="mt-2 text-2xl font-mono font-semibold text-gray-900">
        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <div className="mt-2 flex items-center text-xs">
        <span className={`${positive ? 'text-success-500' : 'text-danger-500'} flex items-center`}>
          <i className={`${positive ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i> {changePercent}%
        </span>
        <span className="ml-1.5 text-gray-500">vs last month</span>
      </div>
    </div>
  );
}
