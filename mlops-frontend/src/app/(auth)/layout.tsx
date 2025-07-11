'use client'

import { Box, Flex } from '@chakra-ui/react'
// import { Header } from '@/components/layout/Header'
// import { Sidebar } from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useState } from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <Flex h="100vh">
      {/* <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} /> */}
      <Sidebar isCollapsed={!isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Box
        flex="1"
        ml={{ base: 0, lg: isSidebarOpen ? '280px' : '80px' }}
        transition="margin-left 0.3s"
      >
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box as="main" p={0} overflowY="auto" h="calc(100vh - 64px)">
          {children}
        </Box>
      </Box>
    </Flex>
  )
}
