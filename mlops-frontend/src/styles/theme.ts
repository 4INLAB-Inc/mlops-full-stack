import { extendTheme } from '@chakra-ui/react'

const colors = {
  brand: {
    50: '#fff3e6',
    100: '#ffe0cc',
    200: '#ffc499',
    300: '#ffa866',
    400: '#ff8c33',
    500: '#EB6100', // 4inlab 브랜드 컬러
    600: '#cc4d00',
    700: '#993a00',
    800: '#662600',
    900: '#331300',
  },
  success: {
    50: '#e6fff0',
    100: '#b3ffd6',
    200: '#80ffbc',
    300: '#4dffa3',
    400: '#1aff89',
    500: '#00e673',
    600: '#00b359',
    700: '#008040',
    800: '#004d26',
    900: '#001a0d',
  },
  warning: {
    50: '#fff9e6',
    100: '#fff0b3',
    200: '#ffe680',
    300: '#ffdd4d',
    400: '#ffd41a',
    500: '#e6b800',
    600: '#b38f00',
    700: '#806600',
    800: '#4d3d00',
    900: '#1a1400',
  },
  error: {
    50: '#ffe6e6',
    100: '#ffb3b3',
    200: '#ff8080',
    300: '#ff4d4d',
    400: '#ff1a1a',
    500: '#e60000',
    600: '#b30000',
    700: '#800000',
    800: '#4d0000',
    900: '#1a0000',
  },
}

const fonts = {
  heading: 'Pretendard',
  body: 'Pretendard',
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'lg',
      _hover: {
        transform: 'translateY(-1px)',
        shadow: 'md',
      },
      _active: {
        transform: 'translateY(0)',
      },
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        color: props.colorScheme === 'brand' ? 'white' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          transform: 'translateY(-1px)',
          shadow: 'md',
        },
      }),
      ghost: {
        _hover: {
          transform: 'translateY(-1px)',
          shadow: 'none',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        overflow: 'hidden',
        transition: 'all 0.2s',
        _hover: {
          transform: 'translateY(-2px)',
          shadow: 'lg',
        },
      },
    },
  },
  Stat: {
    baseStyle: {
      container: {
        px: 4,
        py: 3,
        borderRadius: 'lg',
      },
      label: {
        fontSize: 'sm',
        fontWeight: 'medium',
      },
      number: {
        fontSize: '2xl',
        fontWeight: 'bold',
      },
      helpText: {
        fontSize: 'sm',
      },
    },
  },
}

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
}

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

export const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config,
})
