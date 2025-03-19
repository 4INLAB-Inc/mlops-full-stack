'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'
import { ResponsivePie } from '@nivo/pie'

interface DoughnutChartProps {
  data: Array<{
    label: string
    value: number
  }>
  height?: number
}

export default function DoughnutChart({ data, height = 400 }: DoughnutChartProps) {
  const textColor = useColorModeValue('gray.800', 'gray.200')

  const theme = {
    axis: {
      ticks: {
        text: {
          fill: textColor,
        },
      },
      legend: {
        text: {
          fill: textColor,
        },
      },
    },
    tooltip: {
      container: {
        background: useColorModeValue('#fff', '#1A202C'),
        color: textColor,
        fontSize: '12px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '8px 12px',
      },
    },
  }

  return (
    <Box h={height}>
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
        innerRadius={0.6}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={['#EB6100', '#00A3E0', '#7AC943']}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={textColor}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]],
        }}
        theme={theme}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 40,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: textColor,
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
          },
        ]}
      />
    </Box>
  )
}

      },
      legend: {
        text: {
          fill: textColor,
        },
      },
    },
    tooltip: {
      container: {
        background: useColorModeValue('#fff', '#1A202C'),
        color: textColor,
        fontSize: '12px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '8px 12px',
      },
    },
  }

  return (
    <Box h={height}>
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
        innerRadius={0.6}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={['#EB6100', '#00A3E0', '#7AC943']}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={textColor}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]],
        }}
        theme={theme}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 40,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: textColor,
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
          },
        ]}
      />
    </Box>
  )
}
