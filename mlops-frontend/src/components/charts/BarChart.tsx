'use client'

import React from 'react'
import { useColorMode } from '@chakra-ui/react'
import dynamic from 'next/dynamic'

const ApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div>Loading Chart...</div>
})

interface BarChartProps {
  data: Array<{
    name: string
    data: number[]
  }>
  categories: string[]
}

export default function BarChart({ data, categories }: BarChartProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const options = {
    chart: {
      type: 'bar' as const,
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
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      background: 'transparent',
      fontFamily: 'inherit'
    },
    colors: ['#F6AD55', '#4FD1C5'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 6,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: [isDark ? '#CBD5E0' : '#4A5568']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
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
    fill: {
      opacity: 1,
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [50, 100]
      }
    },
    tooltip: {
      enabled: true,
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (val: number) => `${val}%`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
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
      type="bar"
      height="100%"
    />
  )
}
