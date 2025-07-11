'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'
import { ResponsiveLine } from '@nivo/line'

interface ROCChartProps {
  data: Array<{
    x: number
    y: number
  }>
  height?: number
}

export default function ROCChart({ data, height = 400 }: ROCChartProps) {
  const textColor = useColorModeValue('gray.800', 'gray.200')
  const gridColor = useColorModeValue('gray.200', 'gray.700')

  // Transform data for Nivo
  const transformedData = [
    {
      id: 'ROC Curve',
      data: data,
    },
    {
      id: 'Random',
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
  ]

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
    grid: {
      line: {
        stroke: gridColor,
      },
    },
    crosshair: {
      line: {
        stroke: '#EB6100',
        strokeWidth: 1,
        strokeOpacity: 0.5,
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
      <ResponsiveLine
        data={transformedData}
        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
        xScale={{
          type: 'linear',
          min: 0,
          max: 1,
        }}
        yScale={{
          type: 'linear',
          min: 0,
          max: 1,
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'False Positive Rate',
          legendOffset: 35,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'True Positive Rate',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        enablePoints={true}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        enableArea={false}
        useMesh={true}
        theme={theme}
        colors={['#EB6100', '#7AC943']}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 40,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </Box>
  )
}
