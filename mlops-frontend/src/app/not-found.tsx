'use client'

import {
  Box,
  Button,
  Container,
  Text,
  useColorModeValue,
  Flex,
  Image,
  ButtonGroup,
} from '@chakra-ui/react'
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

export default function NotFound() {
  const bgColor = useColorModeValue('#FAFAFA', '#1A1A1A')
  const textColor = useColorModeValue('#1A1A1A', '#FAFAFA')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const accentColor = useColorModeValue('#FF6B00', '#FF8533')
  const circleColor = useColorModeValue('#FF6B00', '#FF8533')

  return (
    <Box 
      minH="100vh" 
      bg={bgColor} 
      position="relative"
      overflow="hidden"
    >
      {/* Logo */}
      <Box
        position="absolute"
        top={{ base: "4", md: "8" }}
        left={{ base: "4", md: "8" }}
      >
        <Image
          src="/4inlab_logo.png"
          alt="4INLAB Logo"
          height={{ base: "40px", md: "50px" }}
        />
      </Box>

      {/* Floating circles */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          position="absolute"
          width={{ base: "40px", md: "60px" }}
          height={{ base: "40px", md: "60px" }}
          borderRadius="full"
          border="2px solid"
          borderColor={circleColor}
          left={`${Math.random() * 90}%`}
          top={`${Math.random() * 90}%`}
          opacity={0.15}
          sx={{
            '@keyframes float': {
              '0%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(15px, -15px) rotate(180deg)' },
              '100%': { transform: 'translate(0, 0) rotate(360deg)' }
            },
            animation: `float ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`
          }}
        />
      ))}

      <Container maxW="container.xl" h="100vh">
        <Flex
          direction="column"
          justify="center"
          align="flex-start"
          h="full"
          px={{ base: 4, md: 8 }}
          position="relative"
        >
          <Box position="relative" mb={8}>
            <Text
              fontSize={{ base: "6xl", md: "8xl", lg: "9xl" }}
              fontWeight="bold"
              color="transparent"
              letterSpacing="tight"
              lineHeight="1"
              sx={{
                WebkitTextStroke: `2px ${accentColor}`,
                position: 'relative',
                zIndex: 2,
              }}
            >
              404
            </Text>
            <Text
              fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
              fontWeight="bold"
              color={textColor}
              letterSpacing="tight"
              lineHeight="1"
              mt={2}
            >
              Page not found
            </Text>
          </Box>

          <Box maxW="md" mb={12}>
            <Text 
              fontSize={{ base: "lg", md: "xl" }}
              color={mutedTextColor}
              mb={2}
              fontWeight="medium"
            >
              죄송합니다. 페이지 공사 중입니다..🛠️
            </Text>
            <Text 
              fontSize={{ base: "md", md: "lg" }}
              color={mutedTextColor}
            >
              더욱 편리한 MLOps 서비스를 위해 열심히 리모델링 중입니다.
              <br />
              조금만 기다려 주시면 멋지게 단장해서 돌아올게요!
            </Text>
          </Box>

          <ButtonGroup spacing={4}>
            <Button
              onClick={() => window.history.back()}
              leftIcon={<FiArrowLeft />}
              variant="outline"
              size="lg"
              borderColor={accentColor}
              color={accentColor}
              _hover={{
                bg: 'transparent',
                transform: 'translateX(-10px)',
              }}
              transition="all 0.2s"
            >
              이전 페이지
            </Button>

            <Button
              as={Link}
              href="/dashboard"
              rightIcon={<FiArrowRight />}
              bg={accentColor}
              color="white"
              size="lg"
              px={8}
              _hover={{
                bg: accentColor,
                transform: 'translateX(10px)',
                textDecoration: 'none'
              }}
              _active={{
                bg: accentColor,
              }}
              transition="all 0.2s"
            >
              대시보드로 이동
            </Button>
          </ButtonGroup>
        </Flex>
      </Container>
    </Box>
  )
}
