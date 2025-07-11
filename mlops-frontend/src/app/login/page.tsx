'use client'

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Image,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { motion, useAnimation } from 'framer-motion'
import { ReactNode } from 'react'
const MotionBox = motion(Box)
const MotionStack = motion(Stack)

interface BackgroundShapeProps {
  children?: ReactNode
  [key: string]: any // Dành cho các props bổ sung mà bạn muốn truyền vào
}

const BackgroundShape = ({ children, ...props }: BackgroundShapeProps) => (
  <MotionBox
    position="absolute"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0.2, 0.4, 0.2],
      scale: [1, 1.1, 1],
      rotateX: [0, 180, 360],
      rotateY: [0, 180, 360],
    }}
    transition={{ 
      duration: 20,
      repeat: Infinity,
      ease: "linear",
      times: [0, 0.5, 1]
    }}
    style={{
      transformStyle: "preserve-3d",
      perspective: "1000px",
      backdropFilter: "blur(5px)",
    }}
    {...props}
  >
    {children}
  </MotionBox>
)

const Grid3D = () => (
  <Box
    position="absolute"
    top={0}
    left={0}
    right={0}
    bottom={0}
    style={{
      background: `
        linear-gradient(to right, rgba(255, 59, 0, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 59, 0, 0.03) 1px, transparent 1px),
        radial-gradient(circle at 50% 50%, rgba(255, 59, 0, 0.05) 0%, transparent 50%)
      `,
      backgroundSize: '30px 30px, 30px 30px, 100% 100%',
      transform: 'perspective(1000px) rotateX(60deg) scale(4)',
      transformOrigin: 'center center',
      animation: 'gridMove 20s linear infinite',
    }}
  />
)

const FloatingParticle = ({ delay = 0, ...props }) => (
  <MotionBox
    position="absolute"
    width="4px"
    height="4px"
    borderRadius="full"
    bg="rgba(255, 255, 255, 0.3)"
    initial={{ y: '100vh' }}
    animate={{
      y: [null, '-100vh'],
      x: [null, props.x || 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
    {...props}
  />
)

const ParticleField = () => (
  <Box position="absolute" w="full" h="full" overflow="hidden">
    {[...Array(20)].map((_, i) => (
      <FloatingParticle
        key={i}
        delay={i * 0.5}
        x={Math.random() * 100 - 50}
        style={{
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </Box>
)

const WavePattern = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.5,
    }}
  >
    <defs>
      <pattern
        id="wave-pattern"
        x="0"
        y="0"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0 20c5-8 15-8 20 0s15 8 20 0"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wave-pattern)" />
  </svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(email, password)
      if (result) {
        toast({
          title: '로그인 성공',
          description: '대시보드로 이동합니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: '로그인 실패',
        description: '이메일 또는 비밀번호를 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('#080b1f', '#000000')}
      position="relative"
      overflow="hidden"
      sx={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        '@keyframes gridMove': {
          '0%': {
            transform: 'perspective(1000px) rotateX(60deg) scale(4) translateY(0)',
          },
          '100%': {
            transform: 'perspective(1000px) rotateX(60deg) scale(4) translateY(30px)',
          },
        },
      }}
    >
      {/* 3D Background Elements */}
      <Grid3D />
      <ParticleField />
      
      {/* Animated 3D Shapes */}
      <BackgroundShape
        top="5%"
        right="10%"
        width="300px"
        height="300px"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 59, 0, 0.12), rgba(255, 59, 0, 0.03))',
          borderRadius: '38% 62% 63% 37% / 41% 44% 56% 59%',
          boxShadow: '0 0 40px rgba(255, 59, 0, 0.08), inset 0 0 20px rgba(255, 59, 0, 0.05)',
        }}
      />
      
      <BackgroundShape
        top="40%"
        left="5%"
        width="250px"
        height="250px"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(0, 112, 243, 0.12), rgba(0, 112, 243, 0.03))',
          borderRadius: '63% 37% 37% 63% / 43% 37% 63% 57%',
          boxShadow: '0 0 40px rgba(0, 112, 243, 0.08), inset 0 0 20px rgba(0, 112, 243, 0.05)',
        }}
      />
      
      <BackgroundShape
        bottom="10%"
        right="20%"
        width="200px"
        height="200px"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 59, 0, 0.08), rgba(255, 59, 0, 0.02))',
          borderRadius: '41% 59% 47% 53% / 48% 44% 56% 52%',
          boxShadow: '0 0 40px rgba(255, 59, 0, 0.05), inset 0 0 20px rgba(255, 59, 0, 0.03)',
        }}
      />
      
      {/* Wave Pattern */}
      <WavePattern />
      
      {/* Main content */}
      <Container maxW="md" py={{ base: '12', md: '24' }} position="relative">
        <MotionStack
          direction="column"
          align="center"
          justify="center"
          minH={{ base: 'auto', md: '70vh' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MotionBox
            bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.8)')}
            p={{ base: '8', md: '10' }}
            borderRadius="2xl"
            boxShadow="xl"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            width="100%"
            position="relative"
            overflow="hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo section */}
            <Flex direction="column" align="center" mb="8">
              <MotionBox
                mb="6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/4inlab_logo.png"
                  alt="4INLAB Logo"
                  width={200}
                  height={50}
                  style={{ objectFit: 'contain' }}
                />
              </MotionBox>
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="800"
                  color={useColorModeValue('gray.800', 'white')}
                  letterSpacing="tight"
                  mb="2"
                  textTransform="uppercase"
                  textAlign="center"
                  position="relative"
                  _after={{
                    content: '""',
                    display: 'block',
                    width: '40px',
                    height: '2px',
                    background: useColorModeValue('brand.500', 'brand.200'),
                    margin: '8px auto',
                  }}
                >
                  4INLAB MLOps Platform
                </Text>
              </MotionBox>
              <Text
                color={useColorModeValue('gray.600', 'gray.300')}
                fontSize="sm"
                textAlign="center"
                maxW="sm"
                fontWeight="medium"
              >
                MLOps 플랫폼의 모든 기능을 이용해보세요
              </Text>
            </Flex>

            {/* Login form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing="6">
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="medium"
                    color={useColorModeValue('gray.700', 'gray.200')}
                  >
                    이메일
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    size="lg"
                    fontSize="md"
                    bg={useColorModeValue('white', 'whiteAlpha.50')}
                    borderWidth="2px"
                    _hover={{
                      borderColor: 'brand.400',
                    }}
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: 'none',
                    }}
                    transition="all 0.2s"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="medium"
                    color={useColorModeValue('gray.700', 'gray.200')}
                  >
                    비밀번호
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      fontSize="md"
                      bg={useColorModeValue('white', 'whiteAlpha.50')}
                      borderWidth="2px"
                      _hover={{
                        borderColor: 'brand.400',
                      }}
                      _focus={{
                        borderColor: 'brand.500',
                        boxShadow: 'none',
                      }}
                      transition="all 0.2s"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        color="gray.400"
                        _hover={{
                          color: 'brand.500',
                          bg: 'transparent',
                        }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    fontSize="md"
                    width="full"
                    bg="brand.primary"
                    color="white"
                    _hover={{
                      bg: 'brand.600',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    _active={{
                      bg: 'brand.700',
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s"
                    isLoading={isLoading}
                    loadingText="로그인 중..."
                    fontWeight="600"
                  >
                    로그인
                  </Button>
                </MotionBox>
              </Stack>
            </form>

            {/* Footer */}
            <Text
              fontSize="sm"
              color={useColorModeValue('gray.500', 'gray.400')}
              textAlign="center"
              mt="8"
            >
              2025 4INLAB Inc. All rights reserved.
            </Text>
          </MotionBox>
        </MotionStack>
      </Container>
    </Box>
  )
}
