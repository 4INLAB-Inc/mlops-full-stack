'use client'

import React from 'react'
import { useColorMode } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { ApexOptions } from 'apexcharts';


const ApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div>Loading Chart...</div>
})

interface AreaChartProps {
  data: Array<{
    name: string
    data: number[]
  }>
  categories: string[]
}

export default function AreaChart({ data, categories }: AreaChartProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const options: ApexOptions = {
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      animations: {
        enabled: true,
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
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2,
      curve: 'smooth' as const,
      lineCap: 'round'
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
      labels: {
        style: {
          colors: isDark ? '#CBD5E0' : '#4A5568',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#CBD5E0' : '#4A5568',
          fontSize: '12px'
        },
        formatter: (value: number) => `${value}%`
      }
    },
    tooltip: {
      enabled: true,
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (value: number) => `${value}%`
      }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      floating: true,
      offsetY: -25,
      offsetX: -5,
      labels: {
        colors: isDark ? '#CBD5E0' : '#4A5568'
      }
    }
  }

  return (
    <ApexCharts
      options={options}
      series={data}
      type="area"
      height="100%"
    />
  )
}
