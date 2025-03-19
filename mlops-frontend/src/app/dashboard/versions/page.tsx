'use client'

import { Container, Stack, Box, useColorModeValue } from '@chakra-ui/react'
import { PageHeader } from '@/components/common/PageHeader'
import { VersionControlTabs } from '@/components/version-control/VersionControlTabs'

export default function VersionControlPage() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={6}>
        <PageHeader
          title="버전 관리"
          subtitle="모델, 데이터셋, 실험 구성의 버전을 관리하고 Git과 연동합니다."
        />

        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          shadow="sm"
          overflow="hidden"
        >
          <VersionControlTabs />
        </Box>
      </Stack>
    </Container>
  )
}
