import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

function TrendChart({ data = [], type = 'bar' }) {
  
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
        Awaiting statistical aggregation data...
      </div>
    );
  }

  // Futuristic visual colors palette
  const COLORS = ['#6366F1', '#38BDF8', '#D946EF', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

  const customTooltipStyle = {
    backgroundColor: 'rgba(9, 13, 26, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#FFFFFF'
  };

  if (type === 'pie') {
    return (
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={70}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={customTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'horizontal-bar') {
    return (
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} horizontal={true} />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} width={90} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
            <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="count" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default Bar Chart for trends & forecasting
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
          <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar dataKey="incidents" fill="var(--color-secondary)" name="Recorded FIRs" maxBarSize={30} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              const isForecast = entry.isForecast || (entry.month && entry.month.includes('Proj'));
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isForecast ? '#F59E0B' : (entry.month === '2026-06' || entry.name === 'Critical (81-100)' ? '#EF4444' : '#6366F1')} 
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
