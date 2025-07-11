// 'use client'

// import { Box, useStyleConfig } from '@chakra-ui/react'
// import Header from '@/components/layout/Header'
// import Sidebar from '@/components/layout/Sidebar'

// export default function RootLayoutClient({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const styles = useStyleConfig('Layout')

//   return (
//     <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
//       <Sidebar __css={styles.sidebar} />
//       <Header __css={styles.header} />
//       <Box as="main" {...styles.main}>
//         <Box {...styles.content}>
//           {children}
//         </Box>
//       </Box>
//     </Box>
//   )
// }
'use client'

import { Box, useStyleConfig } from '@chakra-ui/react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useState } from 'react'

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const styles = useStyleConfig('Layout')

  // Trạng thái cho Sidebar
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Hàm toggle cho Sidebar
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      {/* Truyền props vào Sidebar */}
      <Box width={isSidebarCollapsed ? '80px' : '250px'} bg="gray.800" color="white">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      </Box>

      {/* Truyền props vào Header */}
      <Box padding="20px" bg="gray.900">
        <Header onMenuClick={toggleSidebar} />
      </Box>

      <Box as="main" padding="20px">
        <Box margin="20px">
          {children}
        </Box>
      </Box>
    </Box>
  )
}
