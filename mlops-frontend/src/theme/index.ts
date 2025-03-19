import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const colors = {
  brand: {
    primary: '#EB6100',
    secondary: '#2F2C5C',
    background: '#F8F9FC',
    50: '#E5F0FF',
    100: '#B8D5FF',
    200: '#8ABBFF',
    300: '#5CA1FF',
    400: '#2E87FF',
    500: '#006DFF',
    600: '#0057CC',
    700: '#004199',
    800: '#002B66',
    900: '#001533',
  },
  text: {
    primary: '#222222',
    secondary: '#6B7280',
  },
  dark: {
    background: '#1E1E2E',
    card: '#2A2A3B',
  },
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
}

const fonts = {
  heading: 'Inter, sans-serif',
  body: 'Inter, sans-serif',
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
    },
    variants: {
      primary: {
        bg: 'brand.primary',
        color: 'white',
        _hover: {
          bg: 'darken(brand.primary, 10%)',
          _disabled: {
            bg: 'brand.primary',
          },
        },
      },
      secondary: {
        bg: 'transparent',
        border: '1px solid',
        borderColor: 'brand.primary',
        color: 'brand.primary',
        _hover: {
          bg: 'brand.primary',
          color: 'white',
        },
      },
      ghost: {
        color: 'text.primary',
        _hover: {
          bg: 'rgba(0, 0, 0, 0.04)',
        },
        _dark: {
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          _disabled: {
            bg: 'brand.500',
          },
        },
        _active: { bg: 'brand.700' },
      },
      outline: {
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'xl',
        boxShadow: 'lg',
        p: 6,
        _dark: {
          bg: 'dark.card',
        },
      },
    },
  },
  Tooltip: {
    baseStyle: {
      bg: 'gray.800',
      color: 'white',
      fontSize: 'sm',
      px: '3',
      py: '2',
      borderRadius: 'md',
    },
  },
}

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'dark.background' : 'brand.background',
      color: props.colorMode === 'dark' ? 'white' : 'text.primary',
    },
  }),
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
  },
}

const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles,
})

export default theme
