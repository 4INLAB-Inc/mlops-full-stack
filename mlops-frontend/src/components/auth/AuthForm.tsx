'use client'

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (data: { email: string; password: string }) => void
  isLoading?: boolean
}

export const AuthForm = ({ mode, onSubmit, isLoading = false }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요'
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({ email, password })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="6">
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>이메일</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel>비밀번호</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="sm"
                disabled={isLoading}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          fontSize="md"
          isLoading={isLoading}
          loadingText="로그인 중..."
        >
          {mode === 'login' ? '로그인' : '회원가입'}
        </Button>
      </Stack>
    </form>
  )
}
