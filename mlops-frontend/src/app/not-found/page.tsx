'use client'

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Image,
  Flex,
  keyframes,
} from '@chakra-ui/react'
import { FiHome, FiArrowLeft } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

// 애니메이션 정의
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

export default function NotFoundPage() {
  const router = useRouter()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const buttonBgColor = useColorModeValue('orange.500', 'orange.200')
  const buttonHoverBgColor = useColorModeValue('orange.600', 'orange.300')

  const floatAnimation = `${float} 3s ease-in-out infinite`
  const pulseAnimation = `${pulse} 2s ease-in-out infinite`

  return (
    <Box minH="100vh" bg={bgColor} py={20}>
      <Container maxW="container.xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="center"
          gap={10}
        >
          <Box
            flex={1}
            animation={floatAnimation}
            maxW={{ base: '300px', md: '400px' }}
          >
            <Image
              src="/404_illustration.svg"
              alt="404 Illustration"
              fallback={
                <Box
                  w="full"
                  h="300px"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="6xl" color={textColor}>
                    404
                  </Text>
                </Box>
              }
            />
          </Box>

          <VStack
            flex={1}
            spacing={6}
            textAlign={{ base: 'center', md: 'left' }}
            align={{ base: 'center', md: 'flex-start' }}
          >
            <Heading
              size="2xl"
              bgGradient="linear(to-r, orange.400, orange.600)"
              bgClip="text"
              animation={pulseAnimation}
            >
              페이지를 찾을 수 없습니다
            </Heading>
            
            <Text fontSize="xl" color={textColor}>
              죄송합니다. 페이지 공사 중입니다..🛠️
              <br />
              더욱 편리한 MLOps 서비스를 위해 열심히 리모델링 중입니다.
            </Text>

            <Text fontSize="lg" color={textColor}>
              조금만 기다려 주시면 멋지게 단장해서 돌아올게요!
            </Text>

            <VStack align="stretch" spacing={4} w="full" maxW="400px">
              <Button
                leftIcon={<FiArrowLeft />}
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                width="full"
              >
                이전 페이지로 돌아가기
              </Button>

              <Button
                leftIcon={<FiHome />}
                onClick={() => router.push('/dashboard')}
                bg={buttonBgColor}
                color="white"
                size="lg"
                width="full"
                _hover={{
                  bg: buttonHoverBgColor,
                }}
              >
                대시보드로 이동
              </Button>
            </VStack>
          </VStack>
        </Flex>
      </Container>
    </Box>
  )
}
