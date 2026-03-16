"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, Parameters, DEFAULT_PARAMETERS } from '../components/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
    setLoading(false);
    setError(null);
    try {
      const payload = {
  site_name: "Site 1",

  // ← THIS IS THE MISSING PART
  load_autonomy: {
    daily_load_kw: parameters.siteLoad,          // ← your siteLoad value (kW)
    battery_autonomy_hours: parameters.batteryAutonomy,
    hydrogen_autonomy_hours: parameters.hydrogenAutonomy,
  },

  tech_specs: {
    battery_usable_ratio: parameters.batteryDoD / 100,
    battery_efficiency_percent: parameters.batteryEfficiency,
    fuel_cell_efficiency_percent: parameters.fuelCellEfficiency,
    electrolyzer_efficiency_percent: parameters.electrolyzerEfficiency,
    pv_performance_ratio: parameters.pvEfficiencyFactor,
    peak_sun_hours_per_day: (parameters.janAveragePSH + parameters.augustAveragePSH) / 2,
  },

  global_params: {
    discount_rate_percent: parameters.discountRate,
    inflation_percent: parameters.opexInflation,
    subsidy_percent: parameters.capexSubsidy,
    eaas_price_usd_per_kwh: parameters.eaasPrice,
    project_lifetime_years: parameters.systemLifetime,
    operation_days_per_year: 365,
  }
};

      const response = await fetch('https://hydrogenx.onrender.com/calculate_single_site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      setCalcResult(data);

      // Update live preview
      setPreview({
        lcoe: data.financial_metrics?.lcoe_usd_per_kwh ?? 0,
        lcoh: data.financial_metrics?.lcoh_usd_per_kg ?? 0,
        capex: data.capex_breakdown?.total_capex_after_subsidy_usd ?? 0,
        revenue: data.revenue_streams?.total_revenue_usd_per_year ?? 0,
        totalRevenue: data.revenue_streams?.total_revenue_usd_per_year ?? 0,
        electricityRevenue: data.revenue_streams?.electricity_sales_revenue_usd_per_year ?? 0,
        heatRevenue: data.revenue_streams?.heat_recovery_revenue_usd_per_year ?? 0,
        oxygenRevenue: data.revenue_streams?.oxygen_byproduct_revenue_usd_per_year ?? 0
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
    // Send data directly via URL (no localStorage)
    const dataString = encodeURIComponent(JSON.stringify(calcResult));
    router.push(`/dashboard?data=${dataString}`);
  }
};
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative z-10`}>
        <Sidebar parameters={parameters} onParametersChange={setParameters} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-5" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 p-8 overflow-auto md:ml-0 ml-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">HydrogenX System Design</h1>
          <Button 
            onClick={goDashboard} 
            disabled={!preview || loading}
            className={!preview || loading ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {loading ? 'Computing...' : 'Go to Dashboard'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded">
            <p className="text-blue-200">Calculating system design...</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            title="LCOE ($/kWh)" 
            value={preview?.lcoe ? `$${preview.lcoe.toFixed(3)}` : '—'} 
          />
          <Card 
            title="LCOH ($/kg H₂)" 
            value={preview?.lcoh ? `$${preview.lcoh.toFixed(3)}` : '—'} 
          />
          <Card 
            title="CAPEX ($)" 
            value={preview?.capex ? `$${(preview.capex / 1000).toFixed(1)}k` : '—'} 
          />
          <Card 
            title="Total Revenue ($/yr)" 
            value={preview?.totalRevenue ? `$${(preview.totalRevenue / 1000).toFixed(1)}k` : '—'} 
          />
        </div>

        {preview && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card 
              title="Electricity Revenue ($/yr)" 
              value={preview.electricityRevenue ? `$${(preview.electricityRevenue / 1000).toFixed(1)}k` : '—'} 
            />
            <Card 
              title="Heat Revenue ($/yr)" 
              value={preview.heatRevenue ? `$${(preview.heatRevenue / 1000).toFixed(1)}k` : '—'} 
            />
            <Card 
              title="Oxygen Revenue ($/yr)" 
              value={preview.oxygenRevenue ? `$${(preview.oxygenRevenue / 1000).toFixed(1)}k` : '—'} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
