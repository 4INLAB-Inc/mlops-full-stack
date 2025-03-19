'use client'

import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Image,
  Stack,
} from '@chakra-ui/react'
import { AuthForm } from '@/components/auth/AuthForm'

export default function RegisterPage() {
  const handleRegister = async (data: any) => {
    try {
      // TODO: Implement registration logic
      console.log('Register data:', data)
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        <Stack spacing="8">
          <Stack spacing="6" textAlign="center">
            <Image
              src="/4inlab_logo.png"
              alt="4INLAB Logo"
              mx="auto"
              h="12"
              mb="4"
            />
            <Stack spacing={{ base: '2', md: '3' }}>
              <Heading size={{ base: 'xs', md: 'sm' }}>
                MLOps 플랫폼 회원가입
              </Heading>
              <Text color="gray.500">
                AI/ML 모델 관리와 배포를 더 쉽게
              </Text>
            </Stack>
          </Stack>
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={{ base: 'none', sm: 'md' }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <AuthForm mode="register" onSubmit={handleRegister} />
          </Box>
        </Stack>
      </Container>
    </Flex>
  )
}
