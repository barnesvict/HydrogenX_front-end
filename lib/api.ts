/**
 * API client for HydrogenX backend
 */

const API_BASE = 'https://hydrogenx.onrender.com';

export interface SingleSiteInput {
  site_name?: string;
  latitude?: number;
  longitude?: number;
  daily_load_kw?: number;
  site_load_kw?: number;
  battery_autonomy_hours?: number;
  hydrogen_autonomy_hours?: number;
  electrolyzer_charge_window_hours?: number;
  monthly_ghi?: number[];
  load_autonomy?: {
    daily_load_kw?: number;
    site_load_kw?: number;
    battery_autonomy_hours?: number;
    hydrogen_autonomy_hours?: number;
    electrolyzer_charge_window_hours?: number;
  };
  tech_specs?: {
    battery_usable_ratio: number;
    battery_efficiency_percent: number;
    fuel_cell_efficiency_percent: number;
    electrolyzer_efficiency_percent: number;
    pv_performance_ratio: number;
    peak_sun_hours_per_day?: number;
  };
  global_params?: {
    discount_rate_percent: number;
    inflation_percent: number;
    subsidy_percent: number;
    eaas_price_usd_per_kwh: number;
    project_lifetime_years: number;
    operation_days_per_year: number;
  };
}

export interface OptimizeResponse {
  recommended_battery_autonomy_hours: number;
  recommended_hydrogen_autonomy_hours: number;
  lcoe_improvement_percent: number;
  lcoh_improvement_percent: number;
  npv_improvement_usd: number;
  financial_metrics?: {
    lcoe_usd_per_kwh: number;
    lcoh_usd_per_kg: number;
    npv_usd: number;
    irr_percent: number;
  };
}

export async function calculateSingleSite(input: SingleSiteInput) {
  const response = await fetch(`${API_BASE}/calculate_single_site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 422) {
      throw new Error(
        `Validation Error: ${error.detail?.[0]?.msg || 'Invalid input'}`
      );
    }
    throw new Error(`API Error: ${error.detail || response.statusText}`);
  }

  return response.json();
}

export async function getLocationGHI(lat: number, lon: number) {
  const response = await fetch(`${API_BASE}/location_ghi?lat=${lat}&lon=${lon}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.statusText}`);
  }

  return response.json() as Promise<{ monthly_psh: number[] }>;
}

export async function optimizeSizing(input: SingleSiteInput) {
  const response = await fetch(`${API_BASE}/optimize_sizing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 422) {
      throw new Error(
        `Validation Error: ${error.detail?.[0]?.msg || 'Invalid input'}`
      );
    }
    throw new Error(`API Error: ${error.detail || response.statusText}`);
  }

  return response.json() as Promise<OptimizeResponse>;
}

export async function simulateHourly(
  input: SingleSiteInput,
  hourlyGHI: number[]
) {
  if (hourlyGHI.length !== 8760) {
    throw new Error('Hourly GHI must have exactly 8760 values');
  }

  const response = await fetch(`${API_BASE}/simulate_hourly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_data: input, hourly_ghi: hourlyGHI }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 422) {
      throw new Error(
        `Validation Error: ${error.detail?.[0]?.msg || 'Invalid input'}`
      );
    }
    throw new Error(`API Error: ${error.detail || response.statusText}`);
  }

  return response.json();
}

export function formatCurrency(value: number | undefined) {
  if (!value && value !== 0) return '—';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number | undefined, decimals = 2) {
  if (value === undefined || value === null) return '—';
  return value.toFixed(decimals);
}
