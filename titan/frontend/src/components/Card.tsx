import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    {children}
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'blue',
}) => (
  <Card className="relative">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
        {trend && (
          <p
            className={`text-xs font-semibold mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
    </div>
  </Card>
);
