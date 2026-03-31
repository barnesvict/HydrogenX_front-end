"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '../../components/ui/Card';
import { MonthlyChart } from '../../components/MonthlyChart';
import { Button } from '../../components/ui/Button';
import { OptimizeSizingModal } from '../../components/OptimizeSizingModal';
import {
  formatCurrency,
  formatNumber,
  SingleSiteInput,
  calculateSingleSite,
} from '../../lib/api';

interface DashboardResult {
  lcoe: number;
  lcoh: number;
  capex: number;
  npv: number;
  irr: number;
  paybackPeriod: number;
  monthly: any[];
  solarCapacity: number;
  batteryCapacity: number;
  hydrogenCapacity: number;
  electrolyzerCapacity: number;
  fuelCellCapacity: number;
  electricityRevenue: number;
  heatRevenue: number;
  oxygenRevenue: number;
  totalRevenue: number;
  opex: number;
  maintenanceCost: number;
  areaM2: number;
}

const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<DashboardResult | null>(null);
  const [fullData, setFullData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimizeModalOpen, setOptimizeModalOpen] = useState(false);
  const [lastInput, setLastInput] = useState<SingleSiteInput | null>(null);

  useEffect(() => {
    const dataStr = searchParams.get('data');

    if (dataStr) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataStr));
        setFullData(parsed);

        const mappedResult: DashboardResult = {
          lcoe: parsed.financial_metrics?.lcoe_usd_per_kwh ?? 0,
          lcoh: parsed.financial_metrics?.lcoh_usd_per_kg ?? 0,
          capex: parsed.capex_breakdown?.total_capex_after_subsidy_usd ?? 0,
          npv: parsed.financial_metrics?.npv_usd ?? 0,
          irr: parsed.financial_metrics?.irr_percent ?? 0,
          paybackPeriod: parsed.financial_metrics?.payback_period_years ?? 0,
          monthly: parsed.monthly_data ?? [],
          solarCapacity: parsed.sizing?.pv_capacity_kwp ?? 0,
          batteryCapacity: parsed.sizing?.battery_capacity_kwh ?? 0,
          hydrogenCapacity: parsed.sizing?.h2_storage_capacity_kg ?? 0,
          electrolyzerCapacity: parsed.sizing?.electrolyzer_capacity_kw ?? 0,
          fuelCellCapacity: parsed.sizing?.fuel_cell_capacity_kw ?? 0,
          electricityRevenue:
            parsed.revenue_streams?.electricity_sales_revenue_usd_per_year ?? 0,
          heatRevenue:
            parsed.revenue_streams?.heat_recovery_revenue_usd_per_year ?? 0,
          oxygenRevenue:
            parsed.revenue_streams?.oxygen_byproduct_revenue_usd_per_year ?? 0,
          totalRevenue:
            parsed.revenue_streams?.total_revenue_usd_per_year ?? 0,
          opex: parsed.opex_breakdown?.total_opex_usd_per_year ?? 0,
          maintenanceCost:
            parsed.opex_breakdown?.h2_storage_bop_opex_usd_per_year ?? 0,
          areaM2:
            parsed.sizing?.pv_area_m2 ||
            (parsed.sizing?.pv_capacity_kwp * 6) ||
            0,
        };

        setResult(mappedResult);

        // Reconstruct the input for optimization
        if (parsed.input_data) {
          setLastInput(parsed.input_data);
        }
      } catch (e) {
        console.error('Failed to parse dashboard data:', e);
      }
    }

    setLoading(false);
  }, [searchParams]);

  const handleApplyRecommendations = async (updatedParams: {
    batteryAutonomy: number;
    hydrogenAutonomy: number;
  }) => {
    if (!lastInput) return;

    try {
      setLoading(true);

      // Update the input with new autonomy values
      const updatedInput: SingleSiteInput = {
        ...lastInput,
        load_autonomy: {
          ...lastInput.load_autonomy,
          battery_autonomy_hours: updatedParams.batteryAutonomy,
          hydrogen_autonomy_hours: updatedParams.hydrogenAutonomy,
        },
      };

      // Recalculate
      const newData = await calculateSingleSite(updatedInput);
      setFullData(newData);

      const mappedResult: DashboardResult = {
        lcoe: newData.financial_metrics?.lcoe_usd_per_kwh ?? 0,
        lcoh: newData.financial_metrics?.lcoh_usd_per_kg ?? 0,
        capex: newData.capex_breakdown?.total_capex_after_subsidy_usd ?? 0,
        npv: newData.financial_metrics?.npv_usd ?? 0,
        irr: newData.financial_metrics?.irr_percent ?? 0,
        paybackPeriod: newData.financial_metrics?.payback_period_years ?? 0,
        monthly: newData.monthly_data ?? [],
        solarCapacity: newData.sizing?.pv_capacity_kwp ?? 0,
        batteryCapacity: newData.sizing?.battery_capacity_kwh ?? 0,
        hydrogenCapacity: newData.sizing?.h2_storage_capacity_kg ?? 0,
        electrolyzerCapacity: newData.sizing?.electrolyzer_capacity_kw ?? 0,
        fuelCellCapacity: newData.sizing?.fuel_cell_capacity_kw ?? 0,
        electricityRevenue:
          newData.revenue_streams?.electricity_sales_revenue_usd_per_year ?? 0,
        heatRevenue:
          newData.revenue_streams?.heat_recovery_revenue_usd_per_year ?? 0,
        oxygenRevenue:
          newData.revenue_streams?.oxygen_byproduct_revenue_usd_per_year ?? 0,
        totalRevenue:
          newData.revenue_streams?.total_revenue_usd_per_year ?? 0,
        opex: newData.opex_breakdown?.total_opex_usd_per_year ?? 0,
        maintenanceCost:
          newData.opex_breakdown?.h2_storage_bop_opex_usd_per_year ?? 0,
        areaM2:
          newData.sizing?.pv_area_m2 ||
          (newData.sizing?.pv_capacity_kwp * 6) ||
          0,
      };

      setResult(mappedResult);
    } catch (err) {
      console.error('Error applying recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !result) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">No calculation data available.</p>
          <Button onClick={() => router.push('/')}>
            ← Return to Input Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-gray-800 p-4 md:p-8 border-b md:border-r border-gray-700 overflow-y-auto">
        <h2 className="text-lg md:text-xl font-bold mb-6 text-green-400">
          Key Metrics
        </h2>

        <div className="space-y-3">
          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">LCOE</p>
            <p className="text-lg md:text-xl font-semibold">
              ${formatNumber(result.lcoe, 3)}/kWh
            </p>
          </div>
          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">LCOH</p>
            <p className="text-lg md:text-xl font-semibold">
              ${formatNumber(result.lcoh, 3)}/kg
            </p>
          </div>
          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">CAPEX</p>
            <p className="text-lg md:text-xl font-semibold">
              {formatCurrency(result.capex)}
            </p>
          </div>
          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">NPV</p>
            <p className="text-lg md:text-xl font-semibold">
              {formatCurrency(result.npv)}
            </p>
          </div>
          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">IRR</p>
            <p className="text-lg md:text-xl font-semibold">
              {formatNumber(result.irr, 1)}%
            </p>
          </div>
          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">Payback Period</p>
            <p className="text-lg md:text-xl font-semibold">
              {formatNumber(result.paybackPeriod, 1)} yrs
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold mt-8 mb-4 text-green-400">
          Equipment Sizing
        </h3>
        <div className="space-y-3 text-sm">
          {result.solarCapacity > 0 && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Solar PV</span>
              <span className="font-semibold">
                {formatNumber(result.solarCapacity, 1)} kWp
              </span>
            </div>
          )}
          {result.batteryCapacity > 0 && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Battery</span>
              <span className="font-semibold">
                {formatNumber(result.batteryCapacity, 1)} kWh
              </span>
            </div>
          )}
          {result.hydrogenCapacity > 0 && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">H₂ Storage</span>
              <span className="font-semibold">
                {formatNumber(result.hydrogenCapacity, 1)} kg
              </span>
            </div>
          )}
          {result.electrolyzerCapacity > 0 && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Electrolyzer</span>
              <span className="font-semibold">
                {formatNumber(result.electrolyzerCapacity, 1)} kW
              </span>
            </div>
          )}
          {result.fuelCellCapacity > 0 && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Fuel Cell</span>
              <span className="font-semibold">
                {formatNumber(result.fuelCellCapacity, 1)} kW
              </span>
            </div>
          )}
          {result.areaM2 > 0 && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Area</span>
              <span className="font-semibold">
                {formatNumber(result.areaM2, 0)} m²
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-8">
          <Button className="w-full text-sm" onClick={() => router.push('/')}>
            ← Edit Parameters
          </Button>
          <Button
            className="w-full text-sm"
            onClick={() => {
              if (fullData) {
                const encoded = encodeURIComponent(JSON.stringify(fullData));
                router.push(`/simulation?data=${encoded}`);
              }
            }}
            disabled={!fullData}
          >
            📊 Run Simulation
          </Button>
          <Button
            className="w-full text-sm"
            onClick={() => setOptimizeModalOpen(true)}
          >
            ⚡ Optimize
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">System Dashboard</h1>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                if (fullData) {
                  const encoded = encodeURIComponent(JSON.stringify(fullData));
                  router.push(`/simulation?data=${encoded}`);
                }
              }}
              disabled={!fullData}
              className="text-sm"
            >
              📊 Run Simulation
            </Button>
            <Button
              onClick={() => setOptimizeModalOpen(true)}
              className="text-sm"
            >
              ⚡ Optimize Sizing
            </Button>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          <Card
            title="Electricity Revenue"
            value={formatCurrency(result.electricityRevenue)}
          />
          <Card
            title="Heat Revenue"
            value={formatCurrency(result.heatRevenue)}
          />
          <Card title="Oxygen Revenue" value={formatCurrency(result.oxygenRevenue)} />
          <Card
            title="Total Revenue"
            value={formatCurrency(result.totalRevenue)}
          />
        </div>

        {/* Chart Section */}
        {result.monthly && result.monthly.length > 0 && (
          <div className="bg-gray-800 p-4 md:p-6 rounded border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">
              Monthly Performance
            </h2>
            <MonthlyChart data={result.monthly} />
          </div>
        )}
      </main>

      {/* Optimize Modal */}
      <OptimizeSizingModal
        isOpen={optimizeModalOpen}
        onClose={() => setOptimizeModalOpen(false)}
        input={lastInput || {}}
        onApplyRecommendations={handleApplyRecommendations}
      />
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
