"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, Parameters, DEFAULT_PARAMETERS } from '../components/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { calculateSingleSite, formatCurrency, formatNumber, SingleSiteInput } from '../lib/api';

interface Preview {
  lcoe?: number;
  lcoh?: number;
  capex?: number;
  revenue?: number;
  totalRevenue?: number;
  electricityRevenue?: number;
  heatRevenue?: number;
  oxygenRevenue?: number;
}

export default function HomePage() {
  const router = useRouter();
  const [parameters, setParameters] = useState<Parameters>(DEFAULT_PARAMETERS);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Call backend API when parameters change
  useEffect(() => {
    const doCalc = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload: SingleSiteInput = {
          site_name: 'Sample Site',
          latitude: parameters.latitude,
          longitude: parameters.longitude,
          load_autonomy: {
            daily_load_kw: parameters.siteLoad,
            battery_autonomy_hours: parameters.batteryAutonomy,
            hydrogen_autonomy_hours: parameters.hydrogenAutonomy,
            electrolyzer_charge_window_hours: parameters.electrolyzerChargeWindow,
          },
          tech_specs: {
            battery_usable_ratio: parameters.batteryDoD / 100,
            battery_efficiency_percent: parameters.batteryEfficiency,
            fuel_cell_efficiency_percent: parameters.fuelCellEfficiency,
            electrolyzer_efficiency_percent: parameters.electrolyzerEfficiency,
            pv_performance_ratio: parameters.pvEfficiencyFactor,
            peak_sun_hours_per_day:
              (parameters.janAveragePSH + parameters.augustAveragePSH) / 2,
          },
          global_params: {
            discount_rate_percent: parameters.discountRate,
            inflation_percent: parameters.opexInflation,
            subsidy_percent: parameters.capexSubsidy,
            eaas_price_usd_per_kwh: parameters.eaasPrice,
            project_lifetime_years: parameters.systemLifetime,
            operation_days_per_year: 365,
          },
        };

        const data = await calculateSingleSite(payload);
        
        // Store the input for optimize/simulate
        const resultWithInput = {
          ...data,
          input_data: payload,
        };
        
        setCalcResult(resultWithInput);

        // Update live preview
        setPreview({
          lcoe: data.financial_metrics?.lcoe_usd_per_kwh ?? 0,
          lcoh: data.financial_metrics?.lcoh_usd_per_kg ?? 0,
          capex: data.capex_breakdown?.total_capex_after_subsidy_usd ?? 0,
          revenue: data.revenue_streams?.total_revenue_usd_per_year ?? 0,
          totalRevenue: data.revenue_streams?.total_revenue_usd_per_year ?? 0,
          electricityRevenue:
            data.revenue_streams?.electricity_sales_revenue_usd_per_year ?? 0,
          heatRevenue:
            data.revenue_streams?.heat_recovery_revenue_usd_per_year ?? 0,
          oxygenRevenue:
            data.revenue_streams?.oxygen_byproduct_revenue_usd_per_year ?? 0,
        });
      } catch (e) {
        console.error('Calculation error:', e);
        setError(e instanceof Error ? e.message : 'Calculation failed');
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(doCalc, 500);
    return () => clearTimeout(timeoutId);
  }, [parameters]);

  const goDashboard = () => {
    if (calcResult) {
      const dataString = encodeURIComponent(JSON.stringify(calcResult));
      router.push(`/dashboard?data=${dataString}`);
    }
  };
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block fixed md:relative w-80 z-10 md:z-0`}
      >
        <Sidebar parameters={parameters} onParametersChange={setParameters} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-5"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">HydrogenX Design</h1>
          <Button
            onClick={goDashboard}
            disabled={!preview || loading}
            className={!preview || loading ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {loading ? 'Computing...' : 'View Dashboard'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded">
            <p className="text-red-200 text-sm md:text-base">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded">
            <p className="text-blue-200 text-sm md:text-base">
              Calculating system design...
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card
            title="LCOE ($/kWh)"
            value={
              preview?.lcoe
                ? `$${formatNumber(preview.lcoe, 3)}`
                : '—'
            }
          />
          <Card
            title="LCOH ($/kg H₂)"
            value={
              preview?.lcoh
                ? `$${formatNumber(preview.lcoh, 3)}`
                : '—'
            }
          />
          <Card
            title="CAPEX"
            value={formatCurrency(preview?.capex)}
          />
          <Card
            title="Annual Revenue"
            value={formatCurrency(preview?.totalRevenue)}
          />
        </div>

        {/* Revenue Breakdown */}
        {preview && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <Card
              title="Electricity Revenue"
              value={formatCurrency(preview.electricityRevenue)}
            />
            <Card
              title="Heat Revenue"
              value={formatCurrency(preview.heatRevenue)}
            />
            <Card
              title="Oxygen Revenue"
              value={formatCurrency(preview.oxygenRevenue)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
