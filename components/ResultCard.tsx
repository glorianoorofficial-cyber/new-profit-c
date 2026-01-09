
import React from 'react';

interface ResultCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: 'success' | 'danger' | 'info' | 'none';
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  label, 
  value, 
  subtitle, 
  icon,
  highlight = 'none' 
}) => {
  const getHighlightClasses = () => {
    switch (highlight) {
      case 'success':
        return 'bg-green-50 border-green-100 ring-green-50';
      case 'danger':
        return 'bg-red-50 border-red-100 ring-red-50';
      case 'info':
        return 'bg-blue-50 border-blue-100 ring-blue-50';
      default:
        return 'bg-white border-slate-100';
    }
  };

  const getLabelClasses = () => {
    switch (highlight) {
      case 'success': return 'text-green-700';
      case 'danger': return 'text-red-700';
      case 'info': return 'text-blue-700';
      default: return 'text-slate-500';
    }
  };

  const getValueClasses = () => {
    switch (highlight) {
      case 'success': return 'text-green-600';
      case 'danger': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-slate-900';
    }
  };

  return (
    <div className={`p-5 rounded-3xl border shadow-sm transition-all duration-300 ${getHighlightClasses()}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${getLabelClasses()}`}>
            {label}
          </p>
          <h3 className={`text-3xl font-black mb-1 tabular-nums ${getValueClasses()}`}>
            {value}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-inherit`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
