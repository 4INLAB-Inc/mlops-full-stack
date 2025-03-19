'use client'

import React from 'react'
import {
  Box,
  VStack,
  Text,
  Grid,
  useColorModeValue,
  Heading,
  Select,
  HStack,
} from '@chakra-ui/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterPlot,
  Scatter,
} from 'recharts'

interface DatasetEDAProps {
  dataset?: {
    name: string
    columns: string[]
    distributions?: {
      [key: string]: {
        type: 'categorical' | 'numerical'
        data: Array<{ name: string | number; value: number }>
        correlations?: {
          [key: string]: number
        }
      }
    }
  }
}

export default function DatasetEDA({ dataset }: DatasetEDAProps) {
  const [selectedColumn, setSelectedColumn] = React.useState<string>('')
  const [selectedScatterColumn, setSelectedScatterColumn] = React.useState<string>('')
  
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgColor = useColorModeValue('white', 'gray.800')

  if (!dataset) {
    return (
      <Box p={4} textAlign="center">
        <Text>데이터셋을 선택해주세요.</Text>
      </Box>
    )
  }

  const handleColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(event.target.value)
  }

  const handleScatterColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScatterColumn(event.target.value)
  }

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* 변수 선택 */}
      <HStack spacing={4}>
        <Select
          placeholder="변수 선택"
          value={selectedColumn}
          onChange={handleColumnChange}
          maxW="300px"
        >
          {dataset.columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </Select>
        {dataset.distributions?.[selectedColumn]?.type === 'numerical' && (
          <Select
            placeholder="상관 분석할 변수 선택"
            value={selectedScatterColumn}
            onChange={handleScatterColumnChange}
            maxW="300px"
          >
            {dataset.columns
              .filter((col) => col !== selectedColumn)
              .map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
          </Select>
        )}
      </HStack>

      {selectedColumn && dataset.distributions?.[selectedColumn] && (
        <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
          {/* 분포 차트 */}
          <Box
            p={4}
            borderWidth={1}
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
            height="400px"
          >
            <Heading size="sm" mb={4}>
              {selectedColumn} 분포
            </Heading>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataset.distributions[selectedColumn].data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3182CE" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* 상관관계 차트 (수치형 변수인 경우) */}
          {dataset.distributions[selectedColumn].type === 'numerical' &&
            selectedScatterColumn && (
              <Box
                p={4}
                borderWidth={1}
                borderRadius="lg"
                borderColor={borderColor}
                bg={bgColor}
                height="400px"
              >
                <Heading size="sm" mb={4}>
                  {selectedColumn} vs {selectedScatterColumn}
                </Heading>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedColumn} name={selectedColumn} />
                    <YAxis dataKey={selectedScatterColumn} name={selectedScatterColumn} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="데이터 포인트" data={[]} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            )}
        </Grid>
      )}
    </VStack>
  )
}
