"use client";

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ActivityPoint } from '@/lib/types/activity';

interface ChartsProps {
  data: ActivityPoint[];
}

// Recharts Tooltip props type is complex, using record/unknown for now to satisfy ESLint without any
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  unit: string;
}

const CustomTooltip = ({ active, payload, label, unit }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm text-xs">
        <p className="font-semibold text-gray-500">{`Dist: ${label} km`}</p>
        <p className={`${unit === 'bpm' ? 'text-[#FC4C02]' : 'text-blue-600'}`}>
          {`${payload[0].name}: ${payload[0].value.toFixed(1)} ${unit}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function ActivityCharts({ data }: ChartsProps) {
  // Sample data to keep charts smooth (max 100 points)
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    // Total distance is at the last point
    const step = Math.max(1, Math.floor(data.length / 100));
    return data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map(p => ({
        distance: parseFloat(p.distFromStartKm.toFixed(2)),
        hr: p.heartRate,
        pace: p.paceMinKm,
      }));
  }, [data]);

  if (!data.length) return null;

  return (
    <div className="space-y-6 mt-4">
      <div className="bg-white p-3 rounded-lg border shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Heart Rate (bpm)</h3>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FC4C02" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FC4C02" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="distance" 
                hide 
              />
              <YAxis 
                hide 
                domain={['dataMin - 5', 'dataMax + 5']} 
              />
              <Tooltip content={<CustomTooltip unit="bpm" />} />
              <Area 
                type="monotone" 
                dataKey="hr" 
                name="HR"
                stroke="#FC4C02" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorHr)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pace (min/km)</h3>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="distance" 
                hide 
              />
              <YAxis 
                hide 
                reversed // Pace is better shown reversed (lower min/km at top)
                domain={['dataMin - 0.5', 'dataMax + 0.5']} 
              />
              <Tooltip content={<CustomTooltip unit="min/km" />} />
              <Line 
                type="monotone" 
                dataKey="pace" 
                name="Pace"
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
