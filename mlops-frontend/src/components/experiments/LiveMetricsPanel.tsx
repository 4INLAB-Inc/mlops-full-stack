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
                      name: '학습',
                      data: (metrics.trainAcc ?? []).map((v: number, i: number) => ({ x: i + 1, y: v }))
                    },
                    {
                      name: '검증',
                      data: (metrics.valAcc ?? []).map((v: number, i: number) => ({ x: i + 1, y: v }))
                    }
                  ]}
                  xLabel="Epoch"
                  yLabel="Accuracy (%)"
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
                      data: (metrics.trainLoss ?? []).map((v: number, i: number) => ({ x: i + 1, y: v }))
                    },
                    {
                      name: '검증',
                      data: (metrics.valLoss ?? []).map((v: number, i: number) => ({ x: i + 1, y: v }))
                    }
                  ]}
                  xLabel="Epoch"
                  yLabel="Loss"
                />
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  )
}
