import React from 'react';
import { Slider } from './ui/Slider';
import { NumberInput } from './ui/NumberInput';

export interface Parameters {
  // Project Load & Autonomy
  siteLoad: number;
  dailyLoad: number;
  batteryAutonomy: number;
  hydrogenAutonomy: number;
  totalAutonomy: number; // auto-calculated
  electrolyzerChargeWindow: number;

  // Efficiencies & Constants
  batteryDoD: number;
  batteryEfficiency: number;
  fuelCellEfficiency: number;
  electrolyzerEfficiency: number;
  hydrogenLHV: number;
  pvEfficiencyFactor: number;
  janAveragePSH: number;
  augustAveragePSH: number;

  // Sizing Safety Factors
  oversizingFactorPV: number;
  safetyMargin: number;

  // Financial Assumptions
  discountRate: number;
  systemLifetime: number;
  eaasContractYears: number;
  capexSubsidy: number;
  opexRatePVBattery: number;
  opexRateElectrolyzerFuelCell: number;
  opexInflation: number;
  revenueGrowth: number;
  dieselLCOE: number;
  eaasPrice: number;
  unitsDeployed: number;

  // Cost Parameters
  solarPVCost: number;
  batteryCost: number;
  fuelCellCost: number;
  electrolyzerCost: number;
  oxygenProductionRatio: number;
  oxygenPrice: number;
  areaM2: number;
}

export const DEFAULT_PARAMETERS: Parameters = {
  // Project Load & Autonomy
  siteLoad: 20,
  dailyLoad: 192,
  batteryAutonomy: 12,
  hydrogenAutonomy: 5,
  totalAutonomy: 17, // 12 + 5
  electrolyzerChargeWindow: 5,

  // Efficiencies & Constants
  batteryDoD: 80,
  batteryEfficiency: 90,
  fuelCellEfficiency: 50,
  electrolyzerEfficiency: 70,
  hydrogenLHV: 33.3,
  pvEfficiencyFactor: 1.2,
  janAveragePSH: 5.1,
  augustAveragePSH: 3.3,

  // Sizing Safety Factors
  oversizingFactorPV: 1.2,
  safetyMargin: 1.1,

  // Financial Assumptions
  discountRate: 10,
  systemLifetime: 15,
  eaasContractYears: 10,
  capexSubsidy: 30,
  opexRatePVBattery: 2,
  opexRateElectrolyzerFuelCell: 3,
  opexInflation: 2,
  revenueGrowth: 2,
  dieselLCOE: 0.356,
  eaasPrice: 0.267,
  unitsDeployed: 1,

  // Cost Parameters
  solarPVCost: 650,
  batteryCost: 250,
  fuelCellCost: 1000,
  electrolyzerCost: 800,
  oxygenProductionRatio: 8,
  oxygenPrice: 0.3,
  areaM2: 6,
};

interface SidebarProps {
  parameters: Parameters;
  onParametersChange: (params: Parameters) => void;
}

export function Sidebar({ parameters, onParametersChange }: SidebarProps) {
  const updateParam = (key: keyof Parameters, value: number) => {
    const updated = { ...parameters, [key]: value };

    // Auto-calculate totalAutonomy when battery or hydrogen autonomy changes
    if (key === 'batteryAutonomy' || key === 'hydrogenAutonomy') {
      updated.totalAutonomy = updated.batteryAutonomy + updated.hydrogenAutonomy;
    }

    onParametersChange(updated);
  };

  return (
    <aside className="w-80 p-4 bg-gray-800 h-screen overflow-auto text-white">
      <h2 className="text-lg font-bold mb-6">Project Parameters</h2>

      {/* Project Load & Autonomy */}
      <section className="mb-8 p-4 bg-gray-900 rounded border border-gray-700">
        <h3 className="font-semibold text-green-400 mb-4">Project Load & Autonomy</h3>

        <NumberInput
          label="Site Load (kW)"
          value={parameters.siteLoad}
          onChange={(v) => updateParam('siteLoad', v)}
          tooltip="Peak site load in kW"
          min={0}
        />

        <NumberInput
          label="Daily Load (kWh/day)"
          value={parameters.siteLoad * 24}   // ← derived automatically
          onChange={() => {}}                // disabled
          disabled
          tooltip="Auto-calculated from Site Load"
        />

        <Slider
          label="Battery Autonomy (hours)"
          min={0}
          max={24}
          step={0.1}
          value={parameters.batteryAutonomy}
          onChange={(v) => updateParam('batteryAutonomy', v)}
          tooltip="Hours battery covers alone"
        />

        <Slider
          label="Hydrogen Autonomy (hours)"
          min={0}
          max={24}
          step={0.1}
          value={parameters.hydrogenAutonomy}
          onChange={(v) => updateParam('hydrogenAutonomy', v)}
          tooltip="Hours hydrogen/fuel cell covers alone"
        />

        <NumberInput
          label="Total Autonomy (hours)"
          value={parameters.totalAutonomy}
          onChange={() => {}}
          disabled
          tooltip="Auto-calculated total backup hours"
        />

        <Slider
          label="Electrolyzer Charge Window (hours)"
          min={0}
          max={24}
          step={0.1}
          value={parameters.electrolyzerChargeWindow}
          onChange={(v) => updateParam('electrolyzerChargeWindow', v)}
          tooltip="Peak sun hours for charging"
        />
      </section>

      {/* Efficiencies & Constants */}
      <section className="mb-8 p-4 bg-gray-900 rounded border border-gray-700">
        <h3 className="font-semibold text-green-400 mb-4">Efficiencies & Constants</h3>

        <Slider
          label="Battery DoD (%)"
          min={0}
          max={100}
          step={1}
          value={parameters.batteryDoD}
          onChange={(v) => updateParam('batteryDoD', v)}
          tooltip="Depth of Discharge"
        />

        <Slider
          label="Battery Efficiency (%)"
          min={0}
          max={100}
          step={1}
          value={parameters.batteryEfficiency}
          onChange={(v) => updateParam('batteryEfficiency', v)}
          tooltip="Round-trip efficiency"
        />

        <Slider
          label="Fuel Cell Efficiency (%)"
          min={0}
          max={100}
          step={1}
          value={parameters.fuelCellEfficiency}
          onChange={(v) => updateParam('fuelCellEfficiency', v)}
          tooltip="Electrical output efficiency"
        />

        <Slider
          label="Electrolyzer Efficiency (%)"
          min={0}
          max={100}
          step={1}
          value={parameters.electrolyzerEfficiency}
          onChange={(v) => updateParam('electrolyzerEfficiency', v)}
          tooltip="H₂ production efficiency"
        />

        <NumberInput
          label="Hydrogen LHV (kWh/kg)"
          value={parameters.hydrogenLHV}
          onChange={(v) => updateParam('hydrogenLHV', v)}
          tooltip="Lower Heating Value"
          min={0}
        />

        <NumberInput
          label="PV Efficiency Factor"
          value={parameters.pvEfficiencyFactor}
          onChange={(v) => updateParam('pvEfficiencyFactor', v)}
          tooltip="PV system efficiency factor (losses)"
          step={0.01}
          min={0}
        />

        <NumberInput
          label="Jan Average PSH"
          value={parameters.janAveragePSH}
          onChange={(v) => updateParam('janAveragePSH', v)}
          step={0.1}
          min={0}
        />

        <NumberInput
          label="August Average PSH"
          value={parameters.augustAveragePSH}
          onChange={(v) => updateParam('augustAveragePSH', v)}
          step={0.1}
          min={0}
        />
      </section>

      {/* Sizing Safety Factors */}
      <section className="mb-8 p-4 bg-gray-900 rounded border border-gray-700">
        <h3 className="font-semibold text-green-400 mb-4">Sizing Safety Factors</h3>

        <NumberInput
          label="Oversizing Factor for PV"
          value={parameters.oversizingFactorPV}
          onChange={(v) => updateParam('oversizingFactorPV', v)}
          tooltip="20% extra for losses/excess H₂"
          step={0.01}
          min={0}
        />

        <NumberInput
          label="Safety Margin (general)"
          value={parameters.safetyMargin}
          onChange={(v) => updateParam('safetyMargin', v)}
          tooltip="10% headroom for all components"
          step={0.01}
          min={0}
        />
      </section>

      {/* Financial Assumptions */}
      <section className="mb-8 p-4 bg-gray-900 rounded border border-gray-700">
        <h3 className="font-semibold text-green-400 mb-4">Financial Assumptions</h3>

        <Slider
          label="Discount Rate (%)"
          min={0}
          max={50}
          step={0.1}
          value={parameters.discountRate}
          onChange={(v) => updateParam('discountRate', v)}
          tooltip="For NPV/LCOE calculations"
        />

        <Slider
          label="System Lifetime (years)"
          min={1}
          max={50}
          step={1}
          value={parameters.systemLifetime}
          onChange={(v) => updateParam('systemLifetime', v)}
          tooltip="For LCOE/LCOH amortization"
        />

        <Slider
          label="EaaS Contract (years)"
          min={1}
          max={50}
          step={1}
          value={parameters.eaasContractYears}
          onChange={(v) => updateParam('eaasContractYears', v)}
          tooltip="Revenue & ownership transfer period"
        />

        <Slider
          label="CAPEX Subsidy (%)"
          min={0}
          max={100}
          step={1}
          value={parameters.capexSubsidy}
          onChange={(v) => updateParam('capexSubsidy', v)}
          tooltip="Grant on CAPEX only"
        />

        <NumberInput
          label="OPEX Rate PV/Battery (%)"
          value={parameters.opexRatePVBattery}
          onChange={(v) => updateParam('opexRatePVBattery', v)}
          tooltip="Annual OPEX for PV & Battery"
          step={0.1}
          min={0}
        />

        <NumberInput
          label="OPEX Rate Electrolyzer/Fuel Cell (%)"
          value={parameters.opexRateElectrolyzerFuelCell}
          onChange={(v) => updateParam('opexRateElectrolyzerFuelCell', v)}
          tooltip="Annual OPEX for Electrolyzer & Fuel Cell"
          step={0.1}
          min={0}
        />

        <Slider
          label="OPEX Inflation (%)"
          min={0}
          max={10}
          step={0.1}
          value={parameters.opexInflation}
          onChange={(v) => updateParam('opexInflation', v)}
          tooltip="Annual increase on OPEX"
        />

        <Slider
          label="Revenue Growth (%)"
          min={0}
          max={10}
          step={0.1}
          value={parameters.revenueGrowth}
          onChange={(v) => updateParam('revenueGrowth', v)}
          tooltip="Annual increase in revenue (load growth)"
        />

        <NumberInput
          label="Diesel LCOE ($/kWh)"
          value={parameters.dieselLCOE}
          onChange={(v) => updateParam('dieselLCOE', v)}
          tooltip="Baseline diesel cost"
          step={0.001}
          min={0}
        />

        <NumberInput
          label="EaaS Price ($/kWh)"
          value={parameters.eaasPrice}
          onChange={(v) => updateParam('eaasPrice', v)}
          tooltip="25% less than diesel"
          step={0.001}
          min={0}
        />

        <Slider
          label="Units Deployed"
          min={1}
          max={100}
          step={1}
          value={parameters.unitsDeployed}
          onChange={(v) => updateParam('unitsDeployed', v)}
          tooltip="Total number of units"
        />
      </section>

      {/* Cost Parameters */}
      <section className="mb-8 p-4 bg-gray-900 rounded border border-gray-700">
        <h3 className="font-semibold text-green-400 mb-4">Cost Parameters</h3>

        <NumberInput
          label="Solar PV Cost ($/kWp)"
          value={parameters.solarPVCost}
          onChange={(v) => updateParam('solarPVCost', v)}
          tooltip="Installed cost"
          min={0}
        />

        <NumberInput
          label="Battery Cost ($/kWh)"
          value={parameters.batteryCost}
          onChange={(v) => updateParam('batteryCost', v)}
          tooltip="Installed cost"
          min={0}
        />

        <NumberInput
          label="Fuel Cell Cost ($/kW)"
          value={parameters.fuelCellCost}
          onChange={(v) => updateParam('fuelCellCost', v)}
          tooltip="Installed cost"
          min={0}
        />

        <NumberInput
          label="Electrolyzer Cost ($/kW)"
          value={parameters.electrolyzerCost}
          onChange={(v) => updateParam('electrolyzerCost', v)}
          tooltip="Installed cost"
          min={0}
        />

        <NumberInput
          label="Oxygen Production Ratio (kg O2/kg H2)"
          value={parameters.oxygenProductionRatio}
          onChange={(v) => updateParam('oxygenProductionRatio', v)}
          step={0.1}
          min={0}
        />

        <NumberInput
          label="Oxygen Price ($/kg)"
          value={parameters.oxygenPrice}
          onChange={(v) => updateParam('oxygenPrice', v)}
          tooltip="Selling price for oxygen"
          step={0.01}
          min={0}
        />

        <NumberInput
          label="Area M²"
          value={parameters.areaM2}
          onChange={(v) => updateParam('areaM2', v)}
          tooltip="Rule of thumb 1 kW"
          step={0.1}
          min={0}
        />
      </section>
    </aside>
  );
}
