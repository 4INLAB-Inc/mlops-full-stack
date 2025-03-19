'use client'

import { Box, useStyleConfig } from '@chakra-ui/react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const styles = useStyleConfig('Layout')

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Sidebar __css={styles.sidebar} />
      <Header __css={styles.header} />
      <Box as="main" {...styles.main}>
        <Box {...styles.content}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
