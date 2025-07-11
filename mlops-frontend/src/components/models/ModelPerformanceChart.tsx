'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Box, useColorModeValue } from '@chakra-ui/react'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ModelPerformanceChart = () => {
  const labelColor = useColorModeValue('#1F2C5C', '#CBD5E0')
  const tooltipTheme = useColorModeValue('light', 'dark')

  const chartOptions = useMemo(() => ({
    chart: {
      height: 350,
      type: 'area' as 'area',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      background: 'transparent',
      fontFamily: 'Pretendard'
    },
    stroke: {
      width: [3, 3],
      curve: 'smooth' as 'smooth'
    },
    colors: ['#FF6B00', '#1F2C5C'],
    fill: {
      type: ['gradient', 'gradient'],
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    markers: {
      size: 5,
      colors: ['#FF6B00', '#1F2C5C'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 8,
        sizeOffset: 3
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: useColorModeValue('#f1f1f1', '#2D3748'),
      strokeDashArray: 5,
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
      categories: ['1월', '2월', '3월', '4월', '5월', '6월'],
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
          fontFamily: 'Pretendard'
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
          colors: labelColor,
          fontSize: '12px',
          fontFamily: 'Pretendard'
        },
        formatter: function(value:number) {
          return `${value}%`
        }
      }
    },
    tooltip: {
      theme: tooltipTheme,
      shared: true,
      intersect: false,
      y: {
        formatter: function(value:number) {
          return `${value}%`
        }
      },
      marker: {
        show: true
      }
    },
    legend: {
      position: 'top' as 'top',
      horizontalAlign: 'left' as 'left',
      floating: false,
      fontSize: '13px',
      fontFamily: 'Pretendard',
      labels: {
        colors: labelColor
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 12,
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 25
      }
    }
  }), [labelColor, tooltipTheme])

  const chartData = useMemo(() => [
    {
      name: '학습 정확도',
      data: [85, 87, 89, 88, 90, 91]
    },
    {
      name: '검증 정확도',
      data: [82, 83, 84, 83, 85, 86]
    }
  ], [])

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <ReactApexChart
        options={chartOptions}
        series={chartData}
        type="area"
        height={350}
      />
    </Box>
  )
}

export default ModelPerformanceChart
