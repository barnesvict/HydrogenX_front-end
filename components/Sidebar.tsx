import React from 'react';
import { Slider } from './ui/Slider';

export interface SidebarValues {
  thermalBaseload: number;
  solarCapacity: number;
  solarPerformance: number;
  batteryCapacity: number;
  batteryPower: number;
  batteryReserve: number;
  electrolyzerPower: number;
  electrolyzerEnergy: number;
  electrolyzerHeatRecovery: number;
  storageCapacity: number;
  storagePower: number;
  fuelCellEfficiency: number;
  generatorCapacity: number;
  gridLimit: number;
}

interface SidebarProps {
  values: SidebarValues;
  onChange: (values: SidebarValues) => void;
}

export function Sidebar({ values, onChange }: SidebarProps) {
  const update = (key: keyof SidebarValues, val: number) => {
    onChange({ ...values, [key]: val });
  };

  return (
    <aside className="w-64 p-4 bg-gray-800 h-screen overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Parameters</h2>
      <Slider
        label="Thermal Baseload (kW)"
        min={0}
        max={1000}
        value={values.thermalBaseload}
        onChange={(v) => update('thermalBaseload', v)}
      />

      <Slider
        label="Solar PV Capacity (kW)"
        min={0}
        max={1000}
        value={values.solarCapacity}
        onChange={(v) => update('solarCapacity', v)}
      />
      <Slider
        label="Solar PR (%)"
        min={0}
        max={100}
        value={values.solarPerformance}
        onChange={(v) => update('solarPerformance', v)}
      />

      <Slider
        label="Battery Capacity (kWh)"
        min={0}
        max={1000}
        value={values.batteryCapacity}
        onChange={(v) => update('batteryCapacity', v)}
      />
      <Slider
        label="Battery Power (kW)"
        min={0}
        max={500}
        value={values.batteryPower}
        onChange={(v) => update('batteryPower', v)}
      />
      <Slider
        label="Battery Reserve SOC (%)"
        min={0}
        max={100}
        value={values.batteryReserve}
        onChange={(v) => update('batteryReserve', v)}
      />

      <Slider
        label="Electrolyzer Power (kW)"
        min={0}
        max={1000}
        value={values.electrolyzerPower}
        onChange={(v) => update('electrolyzerPower', v)}
      />
      <Slider
        label="Specific Energy (kWh/kg)"
        min={0}
        max={100}
        value={values.electrolyzerEnergy}
        onChange={(v) => update('electrolyzerEnergy', v)}
      />
      <Slider
        label="Heat Recovery (%)"
        min={0}
        max={100}
        value={values.electrolyzerHeatRecovery}
        onChange={(v) => update('electrolyzerHeatRecovery', v)}
      />

      <Slider
        label="H₂ Storage Cap (kg)"
        min={0}
        max={1000}
        value={values.storageCapacity}
        onChange={(v) => update('storageCapacity', v)}
      />
      <Slider
        label="Storage Power (kW)"
        min={0}
        max={500}
        value={values.storagePower}
        onChange={(v) => update('storagePower', v)}
      />
      <Slider
        label="FC Efficiency (%)"
        min={0}
        max={100}
        value={values.fuelCellEfficiency}
        onChange={(v) => update('fuelCellEfficiency', v)}
      />

      <Slider
        label="Generator Capacity (kW)"
        min={0}
        max={1000}
        value={values.generatorCapacity}
        onChange={(v) => update('generatorCapacity', v)}
      />
      <Slider
        label="Grid Import Limit (kW)"
        min={0}
        max={1000}
        value={values.gridLimit}
        onChange={(v) => update('gridLimit', v)}
      />
    </aside>
  );
}
