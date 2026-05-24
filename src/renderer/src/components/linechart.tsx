import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

type Dataset = {
  label: string;
  data: number[];
  borderColor?: string; // optional for custom color
  backgroundColor?: string; // optional for fill
};

type Props = {
  labels: string[];
  datasets: Dataset[];
};

const LineChart: React.FC<Props> = ({ labels, datasets }) => {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      tension: 0.3, // smooth curves
      borderColor: ds.borderColor || '#3b82f6', // default blue line
      backgroundColor: ds.backgroundColor || 'rgba(59, 130, 246, 0.2)', // light fill under line
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
    })),
  };

  const options: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'top',
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      type: 'category',
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10,
      },
      grid: {
        display: false,
      },
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      ticks: {
        stepSize: 10,
      }
    },
  },
};

  return <Line data={data} options={options} />;
};

export default LineChart;