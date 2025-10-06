interface ProgressBarProps {
    current: number;
    total: number;
    estimatedTime?: string;
  }
  
  export default function ProgressBar({ current, total, estimatedTime }: ProgressBarProps) {
    const percentage = (current / total) * 100;
  
    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white mb-2">
          <span>Question {current} of {total}</span>
          <div className="text-right">
            <span>{Math.round(percentage)}%</span>
            {estimatedTime && <span className="block text-xs text-gray-300">~{estimatedTime}</span>}
          </div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }