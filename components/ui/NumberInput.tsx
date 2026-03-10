import React, { ReactNode } from 'react';
import { Tooltip } from './Tooltip';
import clsx from 'clsx';

interface NumberInputProps {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  disabled?: boolean;
  tooltip?: ReactNode;
  step?: number;
  min?: number;
  max?: number;
}

export function NumberInput({
  label,
  value,
  onChange,
  disabled = false,
  tooltip,
  step = 0.01,
  min,
  max
}: NumberInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 flex items-center">
        {label}
        {tooltip && (
          <span className="ml-2">
            <Tooltip content={tooltip}>
              <span className="text-gray-400 cursor-help">?</span>
            </Tooltip>
          </span>
        )}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        className={clsx(
          'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm',
          'focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500',
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-800' : ''
        )}
      />
    </div>
  );
}
