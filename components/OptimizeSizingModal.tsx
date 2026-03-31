"use client";

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { optimizeSizing, formatNumber, formatCurrency, SingleSiteInput, OptimizeResponse } from '../lib/api';

interface OptimizeSizingModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: SingleSiteInput;
  onApplyRecommendations: (updatedParams: {
    batteryAutonomy: number;
    hydrogenAutonomy: number;
  }) => void;
}

export function OptimizeSizingModal({
  isOpen,
  onClose,
  input,
  onApplyRecommendations,
}: OptimizeSizingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizeResponse | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await optimizeSizing(input);
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to optimize sizing'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyRecommendations({
        batteryAutonomy: result.recommended_battery_autonomy_hours,
        hydrogenAutonomy: result.recommended_hydrogen_autonomy_hours,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Optimize Sizing</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {!result && (
          <div>
            <p className="text-gray-300 mb-6">
              This will analyze your system and recommend optimal battery and
              hydrogen autonomy hours to minimize LCOE/LCOH while maintaining
              reliability.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleOptimize}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Optimizing...' : 'Run Optimization'}
              </Button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900 rounded border border-green-700">
                <p className="text-sm text-gray-400 mb-1">
                  Recommended Battery Autonomy
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {formatNumber(result.recommended_battery_autonomy_hours, 1)} hours
                </p>
              </div>

              <div className="p-4 bg-gray-900 rounded border border-green-700">
                <p className="text-sm text-gray-400 mb-1">
                  Recommended Hydrogen Autonomy
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {formatNumber(result.recommended_hydrogen_autonomy_hours, 1)} hours
                </p>
              </div>

              <div className="p-4 bg-gray-900 rounded border border-blue-700">
                <p className="text-sm text-gray-400 mb-1">LCOE Improvement</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatNumber(result.lcoe_improvement_percent, 1)}%
                </p>
              </div>

              <div className="p-4 bg-gray-900 rounded border border-blue-700">
                <p className="text-sm text-gray-400 mb-1">LCOH Improvement</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatNumber(result.lcoh_improvement_percent, 1)}%
                </p>
              </div>
            </div>

            {result.financial_metrics && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900 rounded border border-gray-700">
                <div>
                  <p className="text-xs text-gray-400 uppercase">
                    New LCOE ($/kWh)
                  </p>
                  <p className="text-lg font-semibold text-white mt-1">
                    ${formatNumber(result.financial_metrics.lcoe_usd_per_kwh, 3)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">
                    New LCOH ($/kg)
                  </p>
                  <p className="text-lg font-semibold text-white mt-1">
                    ${formatNumber(result.financial_metrics.lcoh_usd_per_kg, 3)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">New NPV</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {formatCurrency(result.financial_metrics.npv_usd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">New IRR (%)</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {formatNumber(result.financial_metrics.irr_percent, 1)}%
                  </p>
                </div>
              </div>
            )}

            {result.npv_improvement_usd > 0 && (
              <div className="p-4 bg-green-900 border border-green-700 rounded">
                <p className="text-green-200">
                  💰 NPV Improvement:{' '}
                  <span className="font-bold">
                    {formatCurrency(result.npv_improvement_usd)}
                  </span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleApply} className="flex-1">
                Apply Recommendations
              </Button>
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
