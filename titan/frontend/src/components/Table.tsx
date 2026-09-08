import React from 'react';

interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'Sin datos para mostrar',
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key as string}
                className={`px-4 py-3 text-left font-semibold text-slate-900 dark:text-white ${col.width || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer' : ''
                } transition-colors`}
            >
              {columns.map((col) => (
                <td
                  key={col.key as string}
                  className={`px-4 py-3 text-slate-900 dark:text-slate-300 ${col.width || ''}`}
                >
                  {col.render
                    ? col.render(row[col.key as string], row)
                    : row[col.key as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
