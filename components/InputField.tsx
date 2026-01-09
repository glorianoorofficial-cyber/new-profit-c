
import React from 'react';

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  primary?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  icon,
  primary = false
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-600 ml-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min="0"
          className={`
            w-full py-3.5 px-4 outline-none transition-all duration-200 border rounded-2xl
            ${icon ? 'pl-11' : 'pl-5'}
            ${primary 
              ? 'bg-blue-50/30 border-blue-100 text-blue-900 placeholder:text-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100' 
              : 'bg-slate-50/50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:border-slate-300 focus:ring-4 focus:ring-slate-100'
            }
            font-semibold text-lg
          `}
        />
      </div>
    </div>
  );
};
