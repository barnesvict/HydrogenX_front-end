"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '../../components/ui/Card';
import { MonthlyChart } from '../../components/MonthlyChart';
import { Button } from '../../components/ui/Button';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dataStr = searchParams.get('data');
  let result: any = null;
  try {
    if (dataStr) {
      result = JSON.parse(decodeURIComponent(dataStr));
    }
  } catch (e) {
    console.error('failed to parse dashboard data', e);
  }

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No data available. Please run a calculation on the home page.</p>
          <Button onClick={() => router.push('/')}>← Return to Home</Button>
        </div>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (!value) return '—';
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined || value === null) return '—';
    return value.toFixed(decimals);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar with key metrics */}
      <aside className="w-80 bg-gray-800 p-6 overflow-auto border-r border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-green-400">Key Metrics</h2>

        <div className="space-y-4">
          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">LCOE (Levelized Cost of Energy)</p>
            <p className="text-lg font-semibold">${formatNumber(result.lcoe, 3)}/kWh</p>
          </div>

          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">LCOH (Levelized Cost of Hydrogen)</p>
            <p className="text-lg font-semibold">${formatNumber(result.lcoh, 3)}/kg</p>
          </div>

          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">CAPEX (Capital Expenditure)</p>
            <p className="text-lg font-semibold">{formatCurrency(result.capex)}</p>
          </div>

          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">NPV (Net Present Value)</p>
            <p className="text-lg font-semibold">{formatCurrency(result.npv)}</p>
          </div>

          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">IRR (Internal Rate of Return)</p>
            <p className="text-lg font-semibold">{formatNumber(result.irr, 1)}%</p>
          </div>

          <div className="p-3 bg-gray-900 rounded border border-gray-700">
            <p className="text-xs text-gray-400">Payback Period</p>
            <p className="text-lg font-semibold">{formatNumber(result.paybackPeriod, 1)} years</p>
          </div>
        </div>

        <h3 className="text-lg font-bold mt-8 mb-4 text-green-400">Equipment Sizing</h3>
        <div className="space-y-3 text-sm">
          {result.solarCapacity && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Solar PV Capacity</span>
              <span className="font-semibold">{formatNumber(result.solarCapacity, 1)} kWp</span>
            </div>
          )}
          {result.batteryCapacity && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Battery Capacity</span>
              <span className="font-semibold">{formatNumber(result.batteryCapacity, 1)} kWh</span>
            </div>
          )}
          {result.hydrogenCapacity && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">H₂ Storage Capacity</span>
              <span className="font-semibold">{formatNumber(result.hydrogenCapacity, 1)} kg</span>
            </div>
          )}
          {result.electrolyzerCapacity && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Electrolyzer Capacity</span>
              <span className="font-semibold">{formatNumber(result.electrolyzerCapacity, 1)} kW</span>
            </div>
          )}
          {result.fuelCellCapacity && (
            <div className="flex justify-between p-2 bg-gray-900 rounded">
              <span className="text-gray-400">Fuel Cell Capacity</span>
              <span className="font-semibold">{formatNumber(result.fuelCellCapacity, 1)} kW</span>
            </div>
          )}
        </div>

        <Button 
          className="w-full mt-8"
          onClick={() => router.push('/')}
        >
          ← Edit Parameters
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          <span className="text-gray-400 text-sm">Annual Analysis</span>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            title="Electricity Revenue" 
            value={formatCurrency(result.electricityRevenue)} 
          />
          <Card 
            title="Heat Revenue" 
            value={formatCurrency(result.heatRevenue)} 
          />
          <Card 
            title="Oxygen Revenue" 
            value={formatCurrency(result.oxygenRevenue)} 
          />
          <Card 
            title="Total Revenue" 
            value={formatCurrency(result.totalRevenue)} 
          />
        </div>

        {/* Operational Data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Energy Generation</h3>
            <div className="space-y-2 text-sm">
              {result.renewableEnergy && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Renewable Energy</span>
                  <span className="font-semibold">{formatNumber(result.renewableEnergy, 0)} kWh</span>
                </div>
              )}
              {result.hydrogenProduction && (
                <div className="flex justify-between">
                  <span className="text-gray-500">H₂ Production</span>
                  <span className="font-semibold">{formatNumber(result.hydrogenProduction, 1)} kg</span>
                </div>
              )}
              {result.oxygenProduction && (
                <div className="flex justify-between">
                  <span className="text-gray-500">O₂ Production</span>
                  <span className="font-semibold">{formatNumber(result.oxygenProduction, 1)} kg</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Cost Breakdown</h3>
            <div className="space-y-2 text-sm">
              {result.opex && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual OPEX</span>
                  <span className="font-semibold">{formatCurrency(result.opex)}</span>
                </div>
              )}
              {result.maintenanceCost && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Maintenance Cost</span>
                  <span className="font-semibold">{formatCurrency(result.maintenanceCost)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Efficiency Metrics</h3>
            <div className="space-y-2 text-sm">
              {result.systemEfficiency && (
                <div className="flex justify-between">
                  <span className="text-gray-500">System Efficiency</span>
                  <span className="font-semibold">{formatNumber(result.systemEfficiency, 1)}%</span>
                </div>
              )}
              {result.renewableFraction && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Renewable Fraction</span>
                  <span className="font-semibold">{formatNumber(result.renewableFraction, 1)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {result.monthly && result.monthly.length > 0 && (
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Monthly Revenue & Performance</h2>
            <MonthlyChart data={result.monthly} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
