import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
