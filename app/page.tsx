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

  // Call backend API when parameters change
  useEffect(() => {
    const doCalc = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://hydrogenx.onrender.com/calculate_single_site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parameters })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCalcResult(data);
        
        // Extract preview values from response
        setPreview({
          lcoe: data.lcoe ?? 0,
          lcoh: data.lcoh ?? 0,
          capex: data.capex ?? 0,
          revenue: data.revenue ?? data.totalRevenue ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          electricityRevenue: data.electricityRevenue ?? 0,
          heatRevenue: data.heatRevenue ?? 0,
          oxygenRevenue: data.oxygenRevenue ?? 0
        });
      } catch (e) {
        console.error('Calculation error:', e);
        setError(e instanceof Error ? e.message : 'Calculation failed');
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(doCalc, 500);
    return () => clearTimeout(timeoutId);
  }, [parameters]);

  const goDashboard = () => {
    if (calcResult) {
      router.push('/dashboard?data=' + encodeURIComponent(JSON.stringify(calcResult)));
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar parameters={parameters} onParametersChange={setParameters} />
      <main className="flex-1 p-8 overflow-auto">
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
