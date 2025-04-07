'use client'

import { ChakraProvider } from '@chakra-ui/react'
import theme from '@/theme'
import { AuthProvider } from '@/contexts/AuthContext'
import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>{children}</AuthProvider>
      </ChakraProvider>
    </SessionProvider>
  )
}
