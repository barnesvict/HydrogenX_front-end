import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title: string;
  value: string | number;
  className?: string;
}

export function Card({ title, value, className }: CardProps) {
  return (
    <div
      className={clsx(
        'p-4 rounded bg-gray-800 shadow',
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-400">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
