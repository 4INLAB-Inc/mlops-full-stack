'use client'

import React, { useState } from 'react';
import {
  SimpleGrid,
  Box,
  Text,
  useColorModeValue,
  Container,
  Skeleton,
  Flex,
} from '@chakra-ui/react'
import { DatasetCard } from './DatasetCard'

interface Dataset {
  id: string
  name: string
  type: string
  description: string  // Thêm description
  size: number
  lastModified: string
  rows: number
  columns: number
  status: string  // Thêm status
  progress: number  // Thêm progress
  tags: string[]
}

interface DatasetListProps {
  datasets?: Dataset[]
  selectedDataset?: string
  onSelectDataset: (id: string) => void
  onDeleteDataset?: (id: string) => void
  onEditDataset?: (id: string) => void
  onDownloadDataset?: (id: string) => void
}

export default function DatasetList({
  datasets = [],
  selectedDataset,
  onSelectDataset,
  onDeleteDataset,
  onEditDataset,
  onDownloadDataset,
}: DatasetListProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (!Array.isArray(datasets)) {
    return (
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={4}
        w="full"
      >
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height="200px" borderRadius="lg" />
        ))}
      </SimpleGrid>
    )
  }

  if (datasets.length === 0) {
    return (
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
        textAlign="center"
        w="full"
      >
        <Text color={textColor} fontSize="lg">
          데이터셋이 없습니다
        </Text>
        <Text color="gray.500" fontSize="sm" mt={2}>
          새로운 데이터셋을 추가해주세요
        </Text>
      </Box>
    )
  }

  return (
    <Container maxW="full" p={0}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={4}
        w="full"
      >
        {datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            isSelected={selectedDataset === dataset.id}
            onSelect={() => onSelectDataset(dataset.id)}
            onEdit={onEditDataset}
            onDelete={onDeleteDataset}
            onDownload={onDownloadDataset}
            viewMode={viewMode}
          />
        ))}
      </SimpleGrid>
    </Container>
  )
}
