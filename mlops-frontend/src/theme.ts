import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: 'var(--font-pretendard)',
    body: 'var(--font-pretendard)',
  },
  colors: {
    brand: {
      primary: '#EB6100',
      secondary: '#2F2C5C',
      50: '#FFF4E6',
      100: '#FFE8CC',
      200: '#FFD199',
      300: '#FFB966',
      400: '#FFA233',
      500: '#EB6100',
      600: '#D55500',
      700: '#BF4C00',
      800: '#A84200',
      900: '#923800',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderWidth: '2px',
            borderRadius: 'lg',
            _hover: {
              borderColor: 'brand.400',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: 'none',
            },
            transition: 'all 0.2s',
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: '500',
        fontSize: 'sm',
        marginBottom: '2',
      },
    },
    Container: {
      baseStyle: {
        maxW: 'container.xl',
      },
    },
  },
  styles: {
    global: {
      'html, body': {
        bg: 'var(--background-light)',
        color: 'var(--text-primary)',
        lineHeight: 'tall',
      },
      '::selection': {
        backgroundColor: 'brand.500',
        color: 'white',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: 'gray.200',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: 'gray.300',
        },
      },
    },
  },
})

export default theme
