'use client'

import { Box, Card, CardBody, Grid, GridItem, Heading, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false })

interface Props {
  experimentId: string
}

export function LiveMetricsPanel({ experimentId }: Props) {
  const [metrics, setMetrics] = useState({
    trainAcc: [],
    valAcc: [],
    trainLoss: [],
    valLoss: [],
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments/${experimentId}`)
      const data = await res.json()
      setMetrics(data.metrics)
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [experimentId])

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
      <GridItem>
        <Card variant="outline">
          <CardBody>
            <Stack spacing={4}>
              <Heading size="sm">정확도 곡선</Heading>
              <Box h="300px">
                <LineChart
                  data={[
                    {
                      name: '학습', // Training accuracy
                      data: metrics.trainAcc ?? [],  // Dữ liệu cho trục y của "학습"
                    },
                    {
                      name: '검증', // Validation accuracy
                      data: metrics.valAcc ?? [],  // Dữ liệu cho trục y của "검증"
                    }
                  ]}
                  xLabel="Epoch"  // Nhãn trục x
                  yLabel="Accuracy (%)"  // Nhãn trục y
                  categories={metrics.trainAcc?.map((_, index) => (index + 1).toString())}  // Chuyển số thành chuỗi
                />
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </GridItem>

      <GridItem>
        <Card variant="outline">
          <CardBody>
            <Stack spacing={4}>
              <Heading size="sm">손실 곡선</Heading>
              <Box h="300px">
                <LineChart
                  data={[
                    {
                      name: '학습',
                      data: (metrics.trainLoss ?? [])
                    },
                    {
                      name: '검증',
                      data: (metrics.valLoss ?? [])
                    }
                  ]}
                  xLabel="Epoch"
                  yLabel="Loss"
                  categories={metrics.trainLoss?.map((_, index) => (index + 1).toString())}  // Chuyển số thành chuỗi cho categories
                />
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  )
}
