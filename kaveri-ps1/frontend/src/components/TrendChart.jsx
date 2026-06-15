import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

function TrendChart({ data = [], type = 'bar' }) {
  
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
        Awaiting statistical aggregation data...
      </div>
    );
  }

  // Color palette for charts
  const COLORS = ['#1B2A4A', '#C8922A', '#4A5568', '#276749', '#9B1C1C', '#3182CE', '#805AD5', '#319795'];

  if (type === 'pie') {
    return (
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default Bar Chart for trends
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A5568' }} />
          <YAxis tick={{ fontSize: 11, fill: '#4A5568' }} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="incidents" fill="#1B2A4A" name="Recorded FIRs" maxBarSize={45}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.month === '2026-06' || entry.name === 'Critical (81-100)' ? '#9B1C1C' : '#1B2A4A'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
