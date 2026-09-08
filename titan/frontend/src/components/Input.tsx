import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
          bg-white dark:bg-slate-700 text-slate-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
    {error && (
      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
    )}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
    )}
    <select
      className={`
        w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
        bg-white dark:bg-slate-700 text-slate-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${error ? 'border-red-500 focus:ring-red-500' : ''}
        ${className}
      `}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
    )}
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
    )}
    <textarea
      className={`
        w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
        bg-white dark:bg-slate-700 text-slate-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors resize-none
        ${error ? 'border-red-500 focus:ring-red-500' : ''}
        ${className}
      `}
      {...props}
    />
    {error && (
      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
    )}
  </div>
);
