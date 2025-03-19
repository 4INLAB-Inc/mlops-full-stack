import {
  Box,
  Card,
  CardBody,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Progress,
  Badge,
  Icon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
} from '@chakra-ui/react'
import { FiBarChart2, FiPieChart, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi'
import { useState } from 'react'

interface DatasetAnalysisProps {
  dataset: any
}

interface FeatureProfile {
  name: string
  type: string
  completeness: number
  uniqueness: number
  distribution: 'normal' | 'skewed' | 'uniform'
  outliers: number
  correlation?: Record<string, number>
}

export function DatasetAnalysis({ dataset }: DatasetAnalysisProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  
  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const accentColor = '#EB6100'

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  const featureProfiles: FeatureProfile[] = [
    {
      name: 'temperature',
      type: 'numeric',
      completeness: 100,
      uniqueness: 80,
      distribution: 'normal',
      outliers: 2,
      correlation: {
        pressure: 0.75,
        vibration: -0.3,
        speed: 0.45
      }
    },
    {
      name: 'pressure',
      type: 'numeric',
      completeness: 98,
      uniqueness: 85,
      distribution: 'skewed',
      outliers: 5,
      correlation: {
        temperature: 0.75,
        vibration: 0.2,
        speed: 0.6
      }
    },
    {
      name: 'vibration',
      type: 'numeric',
      completeness: 95,
      uniqueness: 70,
      distribution: 'uniform',
      outliers: 8,
      correlation: {
        temperature: -0.3,
        pressure: 0.2,
        speed: -0.15
      }
    }
  ]

  const getDistributionColor = (distribution: string) => {
    switch (distribution) {
      case 'normal':
        return 'green'
      case 'skewed':
        return 'yellow'
      case 'uniform':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getCorrelationStrength = (value: number) => {
    const abs = Math.abs(value)
    if (abs >= 0.7) return 'strong'
    if (abs >= 0.3) return 'moderate'
    return 'weak'
  }

  const getCorrelationColor = (value: number) => {
    const strength = getCorrelationStrength(value)
    switch (strength) {
      case 'strong':
        return value > 0 ? 'green.500' : 'red.500'
      case 'moderate':
        return value > 0 ? 'green.300' : 'red.300'
      case 'weak':
        return 'gray.400'
    }
  }

  return (
    <VStack spacing={6} w="full">
      <Card w="full" bg={bgCard} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Heading size="md">데이터 프로파일링</Heading>
            
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {featureProfiles.map((profile) => (
                <Card
                  key={profile.name}
                  variant="outline"
                  cursor="pointer"
                  onClick={() => setSelectedFeature(profile.name)}
                  bg={selectedFeature === profile.name ? `${accentColor}10` : undefined}
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">{profile.name}</Text>
                        <Badge colorScheme={profile.type === 'numeric' ? 'blue' : 'purple'}>
                          {profile.type}
                        </Badge>
                      </HStack>
                      
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Completeness</Text>
                          <Progress
                            value={profile.completeness}
                            size="sm"
                            colorScheme="green"
                            width="60%"
                          />
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Uniqueness</Text>
                          <Progress
                            value={profile.uniqueness}
                            size="sm"
                            colorScheme="blue"
                            width="60%"
                          />
                        </HStack>
                      </VStack>

                      <HStack spacing={4}>
                        <Badge colorScheme={getDistributionColor(profile.distribution)}>
                          {profile.distribution}
                        </Badge>
                        {profile.outliers > 0 && (
                          <HStack spacing={1}>
                            <Icon as={FiAlertTriangle} color="orange.500" />
                            <Text fontSize="sm" color="orange.500">
                              {profile.outliers} outliers
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Grid>

            {selectedFeature && (
              <Card variant="outline">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="sm">Correlation Analysis: {selectedFeature}</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
                      {Object.entries(
                        featureProfiles.find(f => f.name === selectedFeature)?.correlation || {}
                      ).map(([feature, correlation]) => (
                        <HStack key={feature} justify="space-between" p={2}>
                          <Text>{feature}</Text>
                          <Text color={getCorrelationColor(correlation)}>
                            {correlation.toFixed(2)}
                          </Text>
                        </HStack>
                      ))}
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
