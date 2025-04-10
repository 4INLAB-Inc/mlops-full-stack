'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Select,
  Input,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Badge,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts'
import { FiFilter, FiSearch, FiDownload } from 'react-icons/fi'

interface DatasetPreviewProps {
  datasetId: string
}

interface ColumnStats {
  name: string
  type: string
  count: number
  nullCount: number
  uniqueCount: number
  min?: number
  max?: number
  mean?: number
  median?: number
  histogram?: { bin: number; count: number }[]
}

interface DataPoint {
  [key: string]: any
}

export function DatasetPreview({ datasetId }: DatasetPreviewProps) {
  const [activeTab, setActiveTab] = useState('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColumn, setSelectedColumn] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dataset, setDataset] = useState<any | null>(null)  // API 데이터 저장

  // ✅ API에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets/${datasetId}`)
        const data = await response.json()

        // ✅ 각 행에 ID 추가하여 데이터 가공
        const enrichedData = data.data.map((row: any, index: number) => ({
          id: index + 1,  // ID는 1부터 시작
          ...row,
        }))

        setDataset({
          ...data,
          data: enrichedData, // 데이터에 ID 추가됨
        })
      } catch (error) {
        console.error('Error fetching dataset:', error)
      }
    }

    if (datasetId) {
      fetchData()
    }
  }, [datasetId])


  // API에서 "data"를 사용하여 데이터 할당 (mockData 대신)
  const data = dataset?.data || []

  // 컬럼 통계 계산
  const columnStats: ColumnStats[] = useMemo(() => {
    const stats: ColumnStats[] = []
    if (data.length === 0) return stats

    Object.keys(data[0]).forEach(column => {
      const values = data.map(row => row[column])
      const nonNullValues = values.filter(v => v != null)
      
      const stat: ColumnStats = {
        name: column,
        type: typeof values[0],
        count: values.length,
        nullCount: values.length - nonNullValues.length,
        uniqueCount: new Set(values).size,
      }

      if (typeof values[0] === 'number') {
        stat.min = Math.min(...nonNullValues)
        stat.max = Math.max(...nonNullValues)
        stat.mean = nonNullValues.reduce((a, b) => a + b, 0) / nonNullValues.length
        const sorted = [...nonNullValues].sort((a, b) => a - b)
        stat.median = sorted[Math.floor(sorted.length / 2)]
        
        // 히스토그램 데이터 생성
        const binCount = 10
        const binSize = (stat.max! - stat.min!) / binCount
        stat.histogram = Array.from({ length: binCount }, (_, i) => {
          const binStart = stat.min! + i * binSize
          const binEnd = binStart + binSize
          return {
            bin: binStart,
            count: nonNullValues.filter(v => v >= binStart && v < binEnd).length
          }
        })
      }

      stats.push(stat)
    })

    return stats
  }, [data])

  // 검색어 기준으로 데이터 필터링
  const filteredData = useMemo(() => {
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm])

  // 필터링된 데이터를 페이지네이션 적용하여 가져오기
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredData.slice(start, start + rowsPerPage)
  }, [filteredData, page, rowsPerPage])

  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <VStack spacing={4} align="stretch">
      {/* 컨트롤 패널 */}
      <Card bg={bgCard} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <HStack spacing={4}>
            <Input
              placeholder="데이터 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              leftIcon={<FiSearch />}
            />
            <Select
              placeholder="컬럼 선택"
              value={selectedColumn}
              onChange={e => setSelectedColumn(e.target.value)}
            >
              {columnStats.map(stat => (
                <option key={stat.name} value={stat.name}>
                  {stat.name}
                </option>
              ))}
            </Select>
            <Button leftIcon={<FiDownload />} colorScheme="blue">
              CSV 다운로드
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* 메인 콘텐츠 */}
      <Tabs colorScheme="blue" value={activeTab} onChange={index => setActiveTab(index.toString())}>
        <TabList>
          <Tab>테이블 뷰</Tab>
          <Tab>통계 분석</Tab>
          <Tab>시각화</Tab>
        </TabList>

        <TabPanels>
          {/* 테이블 뷰 */}
          <TabPanel px={0}>
            <Card bg={bgCard} borderColor={borderColor} borderWidth={1}>
              <CardBody>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        {columnStats.map(stat => (
                          <Th key={stat.name}>{stat.name}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedData.map((row, idx) => (
                        <Tr key={idx}>
                          {Object.entries(row).map(([key, value]) => (
                            <Td key={key}>
                              {typeof value === 'number'
                                ? value.toFixed(2)
                                : String(value)}
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 통계 분석 */}
          <TabPanel px={0}>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {columnStats.map(stat => (
                <Card key={stat.name} bg={bgCard} borderColor={borderColor} borderWidth={1}>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">{stat.name}</Text>
                        <Badge colorScheme="blue">{stat.type}</Badge>
                      </HStack>
                      <Grid templateColumns="1fr 1fr" gap={4}>
                        <Stat>
                          <StatLabel>총 개수</StatLabel>
                          <StatNumber>{stat.count}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>고유값</StatLabel>
                          <StatNumber>{stat.uniqueCount}</StatNumber>
                        </Stat>
                        {stat.type === 'number' && (
                          <>
                            <Stat>
                              <StatLabel>평균</StatLabel>
                              <StatNumber>{stat.mean?.toFixed(2)}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>중앙값</StatLabel>
                              <StatNumber>{stat.median?.toFixed(2)}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>최소값</StatLabel>
                              <StatNumber>{stat.min?.toFixed(2)}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>최대값</StatLabel>
                              <StatNumber>{stat.max?.toFixed(2)}</StatNumber>
                            </Stat>
                          </>
                        )}
                      </Grid>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          {/* 시각화 */}
          <TabPanel px={0}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {columnStats
                .filter(stat => stat.type === 'number')
                .map(stat => (
                  <Card key={stat.name} bg={bgCard} borderColor={borderColor} borderWidth={1}>
                    <CardBody>
                      <Text fontWeight="bold" mb={4}>{stat.name} 분포</Text>
                      <Box h="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stat.histogram}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="bin"
                                tickFormatter={(value) =>
                                  typeof value === 'number' ? value.toFixed(1) : value
                                }
                              />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="count" fill="#3182CE" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardBody>
                  </Card>
                ))}

              {/* 시계열 데이터 시각화 */}
              <Card bg={bgCard} borderColor={borderColor} borderWidth={1}>
                <CardBody>
                  <Text fontWeight="bold" mb={4}>시계열 트렌드</Text>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      {/* <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="INPUT_DATE" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="temperature" stroke="#3182CE" />
                        <Line type="monotone" dataKey="humidity" stroke="#38A169" />
                      </LineChart> */}
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* X축의 날짜/시간 열 자동 찾기*/}
                        <XAxis
                          dataKey={
                            dataset?.features?.find(f => f.type.includes('datetime'))?.name || 'INPUT_DATE'
                          }
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            if (isNaN(date)) return value;
                        
                            const yy = String(date.getFullYear()).slice(2);
                            const MM = String(date.getMonth() + 1).padStart(2, '0');
                            const dd = String(date.getDate()).padStart(2, '0');
                            const HH = String(date.getHours()).padStart(2, '0');
                            const mm = String(date.getMinutes()).padStart(2, '0');
                        
                            return `${yy}-${MM}-${dd} ${HH}:${mm}`;
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickCount={100}
                          tick={{ fontSize: 10 }}
                          />
                        <YAxis />
                        <RechartsTooltip />

                        {/* 숫자 열 자동 그리기 */}
                        {dataset?.features
                          ?.filter(f => ['int64', 'float64'].includes(f.type))
                          .map((feature, idx) => (
                            <Line
                              key={feature.name}
                              type="monotone"
                              dataKey={feature.name}
                              stroke={['#3182CE', '#38A169', '#DD6B20', '#805AD5'][idx % 4]}
                            />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>

              {/* 상관관계 시각화 */}
              {/* <Card bg={bgCard} borderColor={borderColor} borderWidth={1}>
                <CardBody>
                  <Text fontWeight="bold" mb={4}>변수 간 상관관계</Text>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="temperature" name="Temperature" />
                        <YAxis dataKey="humidity" name="Humidity" />
                        <RechartsTooltip />
                        <Scatter data={data} fill="#3182CE" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card> */}
              {/* 상관관계 시각화 */}
              {dataset?.features && (
                (() => {
                  const numericCols = dataset.features.filter(
                    (f: any) => f.type.includes('int') || f.type.includes('float')
                  ).map((f: any) => f.name)

                  // Tạo các cặp (x, y) không trùng nhau
                  const pairs = []
                  for (let i = 0; i < numericCols.length; i++) {
                    for (let j = i + 1; j < numericCols.length; j++) {
                      pairs.push({ xKey: numericCols[i], yKey: numericCols[j] })
                    }
                  }

                  if (pairs.length === 0) {
                    return (
                      <Card bg={bgCard} borderColor={borderColor} borderWidth={1}>
                        <CardBody>
                          <Text color="gray.500">시각화를 위한 숫자형 컬럼이 충분하지 않습니다.</Text>
                        </CardBody>
                      </Card>
                    )
                  }

                  return (
                    <>
                      {pairs.map(({ xKey, yKey }, idx) => (
                        <Card key={`${xKey}-${yKey}-${idx}`} bg={bgCard} borderColor={borderColor} borderWidth={1}>
                          <CardBody>
                            <Text fontWeight="bold" mb={4}>상관관계 ({xKey} vs {yKey})</Text>
                            <Box h="300px">
                              <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey={xKey}
                                    name={xKey}
                                    tickFormatter={(value) =>
                                      typeof value === 'number' ? value.toFixed(1) : value
                                    }
                                  />
                                  <YAxis
                                    dataKey={yKey}
                                    name={yKey}
                                    tickFormatter={(value) =>
                                      typeof value === 'number' ? value.toFixed(1) : value
                                    }
                                  />
                                  <RechartsTooltip />
                                  <Scatter data={data} fill="#3182CE" />
                                </ScatterChart>
                              </ResponsiveContainer>
                            </Box>
                          </CardBody>
                        </Card>
                      ))}
                    </>
                  )
                })()
              )}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}