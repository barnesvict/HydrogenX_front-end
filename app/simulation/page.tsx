"use client";

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { simulateHourly, formatNumber, formatCurrency, SingleSiteInput } from '../../lib/api';

interface HourlySnapshot {
  hour: number;
  pv_production_kw: number;
  load_kw: number;
  battery_soc_kwh: number;
  h2_soc_kg: number;
  electrolyzer_output_kw: number;
  fuel_cell_output_kw: number;
  curtailed_kw: number;
}

const SimulationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hourlyData, setHourlyData] = useState<HourlySnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvContent, setCSVContent] = useState<number[]>([]);
  const [lastInput, setLastInput] = useState<SingleSiteInput | null>(null);

  // Parse CSV file for 8760 GHI values
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const values = lines.map((line) => parseFloat(line.trim())).filter((v) => !isNaN(v));

      if (values.length !== 8760) {
        setError(`CSV must contain exactly 8760 values. Found: ${values.length}`);
        return;
      }

      setCSVContent(values);
      setError(null);
    } catch (err) {
      setError('Failed to parse CSV file');
    }
  };

  const handleRunSimulation = async () => {
    if (!csvContent || csvContent.length === 0) {
      setError('Please upload a CSV with 8760 GHI values');
      return;
    }

    // Try to reconstruct input from URL param
    const dataStr = searchParams.get('data');
    if (!dataStr) {
      setError('No calculation data. Please go back to dashboard.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const calcData = JSON.parse(decodeURIComponent(dataStr));
      const input: SingleSiteInput = {
        site_name: 'Simulation Site',
        load_autonomy: {
          daily_load_kw: calcData.load_autonomy?.daily_load_kw || 20,
          battery_autonomy_hours: calcData.load_autonomy?.battery_autonomy_hours || 12,
          hydrogen_autonomy_hours: calcData.load_autonomy?.hydrogen_autonomy_hours || 5,
        },
      };

      setLastInput(input);

      const result = await simulateHourly(input, csvContent);
      setHourlyData(result.snapshots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = () => {
    if (!hourlyData || hourlyData.length === 0) {
      return null;
    }

    const totalLoad = hourlyData.reduce((sum, h) => sum + h.load_kw, 0);
    const totalPV = hourlyData.reduce((sum, h) => sum + h.pv_production_kw, 0);
    const totalCurtailed = hourlyData.reduce((sum, h) => sum + h.curtailed_kw, 0);
    const totalElectrolyzer = hourlyData.reduce(
      (sum, h) => sum + h.electrolyzer_output_kw,
      0
    );
    const totalFuelCell = hourlyData.reduce(
      (sum, h) => sum + h.fuel_cell_output_kw,
      0
    );
    const avgBattySoC =
      hourlyData.reduce((sum, h) => sum + h.battery_soc_kwh, 0) /
      hourlyData.length;
    const avgH2SoC =
      hourlyData.reduce((sum, h) => sum + h.h2_soc_kg, 0) / hourlyData.length;

    return {
      selfSufficiency: totalLoad > 0 ? ((totalPV / totalLoad) * 100).toFixed(1) : 0,
      totalLoad: totalLoad.toFixed(0),
      totalPV: totalPV.toFixed(0),
      curtailed: totalCurtailed.toFixed(0),
      h2Produced: (totalElectrolyzer / 33.3).toFixed(1), // Simplified H2 calc
      avgBattery: avgBattySoC.toFixed(1),
      avgH2: avgH2SoC.toFixed(1),
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Hourly Simulation</h1>
            <p className="text-gray-400 text-sm mt-1">
              Detailed dispatch simulation with 8760 hourly data points
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard')} className="text-sm">
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Upload Section */}
        <div className="bg-gray-800 rounded border border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload Hourly GHI Data</h2>
          <p className="text-gray-400 text-sm mb-4">
            Upload a CSV file with exactly 8760 hourly GHI values (one value per line,
            in W/m²)
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-300"
              />
              {csvContent.length > 0 && (
                <p className="mt-2 text-green-400 text-sm">
                  ✓ Loaded {csvContent.length} values
                </p>
              )}
            </div>
            <Button
              onClick={handleRunSimulation}
              disabled={loading || csvContent.length === 0}
              className="sm:w-auto"
            >
              {loading ? 'Simulating...' : 'Run Simulation'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card
              title="Self-Sufficiency"
              value={`${kpis.selfSufficiency}%`}
            />
            <Card title="Total Load" value={`${kpis.totalLoad} kWh`} />
            <Card title="PV Generation" value={`${kpis.totalPV} kWh`} />
            <Card title="Curtailed Energy" value={`${kpis.curtailed} kWh`} />
          </div>
        )}

        {/* Detailed Results */}
        {hourlyData.length > 0 && (
          <div className="space-y-8">
            {/* Summary Section */}
            <div className="bg-gray-800 rounded border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-6">Simulation Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase">H₂ Produced</p>
                  <p className="text-2xl font-bold mt-2">{kpis?.h2Produced} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Avg Battery SoC</p>
                  <p className="text-2xl font-bold mt-2">{kpis?.avgBattery} kWh</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Avg H₂ SoC</p>
                  <p className="text-2xl font-bold mt-2">{kpis?.avgH2} kg</p>
                </div>
              </div>
            </div>

            {/* Hourly Data Table (First 24 hours) */}
            <div className="bg-gray-800 rounded border border-gray-700 p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">First 24 Hours (Sample)</h2>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr className="text-gray-400">
                    <th className="text-left py-2 px-2">Hour</th>
                    <th className="text-left py-2 px-2">PV (kW)</th>
                    <th className="text-left py-2 px-2">Load (kW)</th>
                    <th className="text-left py-2 px-2">Battery SoC</th>
                    <th className="text-left py-2 px-2">Electrolyzer</th>
                    <th className="text-left py-2 px-2">Fuel Cell</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyData.slice(0, 24).map((hour, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-900">
                      <td className="py-2 px-2">{hour.hour}</td>
                      <td className="py-2 px-2">{formatNumber(hour.pv_production_kw, 1)}</td>
                      <td className="py-2 px-2">{formatNumber(hour.load_kw, 1)}</td>
                      <td className="py-2 px-2">
                        {formatNumber(hour.battery_soc_kwh, 1)} kWh
                      </td>
                      <td className="py-2 px-2">
                        {formatNumber(hour.electrolyzer_output_kw, 1)} kW
                      </td>
                      <td className="py-2 px-2">
                        {formatNumber(hour.fuel_cell_output_kw, 1)} kW
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-gray-400 text-xs mt-4">
                Showing first 24 hours of {hourlyData.length} total hours
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {hourlyData.length === 0 && csvContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              Upload a CSV file with 8760 hourly GHI values to start the simulation
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select CSV File
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default function SimulationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
          <p className="text-gray-400">Loading simulation...</p>
        </div>
      }
    >
      <SimulationContent />
    </Suspense>
  );
}
