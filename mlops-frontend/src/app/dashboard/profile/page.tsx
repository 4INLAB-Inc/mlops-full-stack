'use client'

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Avatar,
  Card,
  CardBody,
  Stack,
  StackDivider,
  useColorModeValue,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" py={8}>
          <Avatar
            size="2xl"
            name={session?.user?.name || '4INLAB Admin'}
            src="/profile-placeholder.png"
            mb={4}
          />
          <Heading size="lg" mb={2}>
            {session?.user?.name || '4INLAB Admin'}
          </Heading>
          <Text color="gray.500">
            {session?.user?.email || '4inlab@4inlab.kr'}
          </Text>
        </Box>

        <Card bg={bgColor} borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Stack divider={<StackDivider />} spacing={4}>
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  직책
                </Heading>
                <Text>MLOps 관리자</Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  부서
                </Heading>
                <Text>AI 연구소</Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  가입일
                </Heading>
                <Text>2025년 1월 1일</Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
