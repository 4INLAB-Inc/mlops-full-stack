'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { format } from 'date-fns'
import { ResourceUsage } from '../api/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface ResourceChartProps {
  data: ResourceUsage[]
  height?: string
}

export function ResourceChart({ data, height = '300px' }: ResourceChartProps) {
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)')
  const tooltipBackgroundColor = useColorModeValue('rgba(19, 18, 18, 0.9)', 'rgba(0, 0, 0, 0.9)')
  const textColor = useColorModeValue('rgba(0, 0, 0, 0.7)', 'rgba(255, 255, 255, 0.7)')

  const chartData = {
    labels: data.map(d => format(d.timestamp, 'HH:mm')),
    datasets: [
      {
        label: 'CPU 수',
        data: data.map(d => d.cpuCount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'GPU 수',
        data: data.map(d => d.gpuCount),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'CPU 사용률',
        data: data.map(d => d.cpuUtilization),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'GPU 사용률',
        data: data.map(d => d.gpuUtilization),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: tooltipBackgroundColor,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            // if having 사용률, adding %
            if (label.includes('사용률')) {
              return `${label}: ${value}%`;
            }
            return `${label}: ${value}`;
          },
        },    
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          padding: 10,
          color: textColor,
          maxTicksLimit: 24, // Max. labels number in X axis
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '개수',
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '사용률 (%)',
          color: textColor,
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100,
        ticks: {
          color: textColor,
        },
      },
    },
    animations: {
      radius: {
        duration: 400,
        easing: 'linear',
      },
    },
  }

  return (
    <Box height={height} p={2}>
      <Line data={chartData} options={options} />
    </Box>
  )
}
