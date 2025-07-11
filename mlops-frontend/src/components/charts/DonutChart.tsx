'use client'

import React from 'react'
import { useColorMode } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div>Loading Chart...</div>
})

interface DonutChartProps {
  data: number[]
  labels: string[]
}

export default function DonutChart({ data, labels }: DonutChartProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const options = {
    chart: {
      type: 'donut' as const,
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: ['#3182CE', '#38A169', '#E53E3E', '#805AD5'],
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: isDark ? '#CBD5E0' : '#4A5568',
              offsetY: -10
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 'bold',
              color: isDark ? '#CBD5E0' : '#4A5568',
              offsetY: 10,
              formatter: (val: string) => `${parseFloat(val).toFixed(0)}%` // Parse string to number and format
            },
            total: {
              show: true,
              label: '총계',
              fontSize: '16px',
              fontWeight: 600,
              color: isDark ? '#CBD5E0' : '#4A5568'
            }
          }
        }
      }
    },
    stroke: {
      width: 0,
      lineCap: 'round' as 'round' | 'butt' | 'square' // Cast it to a valid value
    },
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,  // Use a valid value like 'center', 'right', or 'left'
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        offsetX: -3
      },
      itemMargin: {
        horizontal: 15
      },
      labels: {
        colors: isDark ? '#CBD5E0' : '#4A5568'
      }
    },
    theme: {
      mode: isDark ? 'dark' : 'light' as 'dark' | 'light' // Cast it to 'dark' | 'light'
    },
    tooltip: {
      enabled: true,
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val: number) => `${val}%`
      }
    },
    dataLabels: {
      enabled: false
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  return (
    <ApexCharts
      options={options}
      series={data}
      type="donut"
      height="100%"
      width="100%"
    />
  )
}
