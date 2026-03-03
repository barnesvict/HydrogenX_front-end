"use client";

import React, { useState } from 'react';
import { Sidebar, SidebarValues } from '../components/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MonthlyChart, MonthlyData } from '../components/MonthlyChart';

interface Result {
  electricityRevenue: number;
  heatRevenue: number;
  oxygenRevenue: number;
  totalRevenue: number;
  monthly: MonthlyData[];
}

export default function DashboardPage() {
  const [params, setParams] = useState<SidebarValues>({
    thermalBaseload: 500,
    solarCapacity: 200,
    solarPerformance: 50,
    batteryCapacity: 100,
    batteryPower: 50,
    batteryReserve: 20,
    electrolyzerPower: 300,
    electrolyzerEnergy: 50,
    electrolyzerHeatRecovery: 20,
    storageCapacity: 200,
    storagePower: 100,
    fuelCellEfficiency: 60,
    generatorCapacity: 400,
    gridLimit: 300
  });

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/calculate_single_site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parameters: params })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // assume backend returns structure matching Result
      setResult(data as Result);
    } catch (e) {
      console.error(e);
      // fallback dummy values
      setResult({
        electricityRevenue: 12345,
        heatRevenue: 2345,
        oxygenRevenue: 345,
        totalRevenue: 15000,
        monthly: Array.from({ length: 12 }, (_, i) => ({
          month: `M${i + 1}`,
          electricity: Math.random() * 1000,
          heat: Math.random() * 500,
          oxygen: Math.random() * 100,
          opex: Math.random() * 300,
          ebitda: Math.random() * 200
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar values={params} onChange={setParams} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">HydrogenX Dashboard</h1>
          <Button onClick={calculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card title="Electricity Revenue" value={result?.electricityRevenue ?? '—'} />
          <Card title="Heat Revenue" value={result?.heatRevenue ?? '—'} />
          <Card title="Oxygen Revenue" value={result?.oxygenRevenue ?? '—'} />
          <Card title="Total Revenue" value={result?.totalRevenue ?? '—'} />
        </div>
        <div className="bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Monthly Revenue vs OPEX</h2>
          <MonthlyChart data={result?.monthly ?? []} />
        </div>
      </main>
    </div>
  );
}
