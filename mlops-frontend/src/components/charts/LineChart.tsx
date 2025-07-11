'use client'

import React from 'react'
import { useColorMode } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div>Loading Chart...</div>
})

interface LineChartProps {
  data: Array<{
    name: string
    data: number[]
  }>
  categories: string[]
  xLabel?: string
  yLabel?: string
}

export default function LineChart({ data, categories, xLabel, yLabel }: LineChartProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const safeTickAmount = categories && categories.length < 20 ? categories.length : 20;

  const options = {
    chart: {
      type: 'line' as const,
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      },
      background: 'transparent',
      fontFamily: 'inherit'
    },
    colors: ['#F6AD55', '#4FD1C5'],
    stroke: {
      width: 3,
      curve: 'smooth' as 'smooth' | 'straight' | 'stepline' | 'linestep' | 'monotoneCubic',
      lineCap: 'round' as 'round' | 'butt' | 'square' // Explicitly cast here
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: 'transparent',
      hover: {
        size: 7
      }
    },
    grid: {
      borderColor: isDark ? '#2D3748' : '#E2E8F0',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    xaxis: {
      categories: categories,
      tickAmount: safeTickAmount,
      title: {
        text: xLabel || '',
        style: {
          color: isDark ? '#CBD5E0' : '#4A5568',
          fontSize: '14px',
        }
      },
      labels: {
        style: {
          colors: isDark ? '#CBD5E0' : '#4A5568',
          fontSize: '12px'
        },
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: [
      {
        title: {
          text: yLabel || '',
          style: {
            color: isDark ? '#CBD5E0' : '#4A5568',
            fontSize: '14px',
          },
        },
        labels: {
          style: {
            colors: isDark ? '#CBD5E0' : '#4A5568',
            fontSize: '12px'
          },
          formatter: (value: number) => {
            if (yLabel?.includes('%')) {
              return `${value}%`; // Return a string (not a number)
            }
            return `${value}`; // Ensure returning a string
          }
        }
      }
    ],
    
    tooltip: {
      enabled: true,
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (value: number) => {
          const isPercent = yLabel?.includes('%');
          const rounded = isPercent ? value.toFixed(2) : value.toFixed(5);
          return isPercent ? `${rounded}%` : rounded;
        }
      },
      marker: {
        show: true
      }
    },
    legend: {
      position: 'top' as 'top' | 'right' | 'bottom' | 'left',
      horizontalAlign: 'right' as 'right' | 'left' | 'center',
      floating: true,
      offsetY: -25,
      offsetX: -5,
      labels: {
        colors: isDark ? '#CBD5E0' : '#4A5568'
      }
    },
    dataLabels: {
      enabled: false
    }
  }

  return (
    <ApexCharts
      options={options}
      series={data}
      type="line"
      height="100%"
    />
  )
}
