"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/ui/Card';
import { MonthlyChart } from '../../components/MonthlyChart';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('calcResult');
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        console.log("✅ Dashboard received data:", parsed);
        setResult(parsed);
      } catch (e) {
        console.error("❌ Failed to parse stored data:", e);
      }
    } else {
      console.warn("⚠️ No data found in localStorage");
    }
    
    setLoading(false);
  }, []);

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '—';
    return `$${(value / 1000).toFixed(1)}k`;
  };

  const formatNumber = (value: number | undefined, decimals = 3) => {
    if (value === undefined || value === null) return '—';
    return value.toFixed(decimals);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900">Loading dashboard...</div>;
  }

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">No calculation data available.</p>
          <Button onClick={() => router.push('/')}>← Return to Input Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">System Dashboard</h1>
          <Button onClick={() => router.push('/')}>← New Calculation</Button>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card 
            title="Electricity Revenue" 
            value={formatCurrency(result.revenue_streams?.electricity_sales_revenue_usd_per_year)} 
          />
          <Card 
            title="Heat Revenue" 
            value={formatCurrency(result.revenue_streams?.heat_recovery_revenue_usd_per_year)} 
          />
          <Card 
            title="Oxygen Revenue" 
            value={formatCurrency(result.revenue_streams?.oxygen_byproduct_revenue_usd_per_year)} 
          />
          <Card 
            title="Total Revenue" 
            value={formatCurrency(result.revenue_streams?.total_revenue_usd_per_year)} 
            
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card title="LCOE ($/kWh)" value={formatNumber(result.financial_metrics?.lcoe_usd_per_kwh)} />
          <Card title="LCOH ($/kg)" value={formatNumber(result.financial_metrics?.lcoh_usd_per_kg)} />
          <Card title="Payback (years)" value={formatNumber(result.financial_metrics?.payback_period_years)} />
        </div>

        {/* Monthly Chart */}
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-6">Monthly Revenue Streams vs OPEX</h2>
          {result.monthly_data && <MonthlyChart data={result.monthly_data} />}
        </div>
      </div>
    </div>
  );
}