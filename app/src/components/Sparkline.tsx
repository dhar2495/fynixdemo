import React from 'react';
import Svg, { Polyline } from 'react-native-svg';

interface Props {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

/** Minimal inline trend line for KPI cards — no axes/labels, just shape. */
export function Sparkline({ data, color, width = 56, height = 22 }: Props) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`)
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
