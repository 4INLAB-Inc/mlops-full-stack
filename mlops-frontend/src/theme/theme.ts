import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  fonts: {
    heading: 'Pretendard',
    body: 'Pretendard',
  },
  colors: {
    brand: {
      50: '#FFF3E6',
      100: '#FFE0CC',
      200: '#FFC499',
      300: '#FFA866',
      400: '#FF8B33',
      500: '#EB6100', // 메인 브랜드 컬러
      600: '#CC5500',
      700: '#A34400',
      800: '#7A3300',
      900: '#522200',
    },
    point: {
      50: '#FEF4EC',
      100: '#FDE4D3',
      200: '#FBCBA8',
      300: '#F9B27D',
      400: '#F78952',
      500: '#EB6100', 
      600: '#BC4D00',
      700: '#8D3A00',
      800: '#5E2600',
      900: '#2F1300',
    },
    secondary: {
      50: '#fff5e6',
      100: '#ffe0b3',
      200: '#ffcc80',
      300: '#ffb74d',
      400: '#ffa31a',
      500: '#ff8f00', 
      600: '#cc7200',
      700: '#995600',
      800: '#663900',
      900: '#331d00',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
          _active: {
            bg: 'brand.700',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
        ghost: {
          color: 'gray.600',
          _hover: {
            bg: 'gray.50',
          },
        },
        point: {
          bg: 'point.500',
          color: 'white',
          _hover: {
            bg: 'point.600',
            _disabled: {
              bg: 'point.300',
            },
          },
          _active: {
            bg: 'point.700',
          },
        },
        secondary: {
          bg: 'secondary.500',
          color: 'white',
          _hover: {
            bg: 'secondary.600',
            _disabled: {
              bg: 'secondary.300',
            },
          },
          _active: {
            bg: 'secondary.700',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          overflow: 'hidden',
          boxShadow: 'sm',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
        },
        header: {
          padding: '6',
          borderBottom: '1px solid',
          borderColor: 'gray.100',
        },
        body: {
          padding: '6',
        },
      },
      variants: {
        elevated: {
          container: {
            bg: 'white',
            boxShadow: 'base',
          },
        },
        outline: {
          container: {
            borderWidth: '1px',
            borderColor: 'gray.200',
          },
        },
      },
      defaultProps: {
        variant: 'elevated',
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: 'gray.100',
            fontSize: 'sm',
            textTransform: 'none',
            letterSpacing: 'normal',
          },
          td: {
            borderColor: 'gray.100',
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        textTransform: 'none',
        fontWeight: 'medium',
      },
    },
    Menu: {
      baseStyle: {
        list: {
          borderRadius: 'xl',
          boxShadow: 'lg',
          p: 2,
        },
        item: {
          borderRadius: 'lg',
          _hover: {
            bg: 'gray.50',
          },
          _focus: {
            bg: 'gray.50',
          },
        },
      },
    },
    Tooltip: {
      baseStyle: {
        borderRadius: 'md',
        bg: 'gray.900',
        color: 'white',
        fontSize: 'sm',
        px: 3,
        py: 2,
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'gray.50',
            _hover: { bg: 'gray.100' },
            _focus: {
              bg: 'white',
              borderColor: 'brand.500',
            },
            _dark: {
              bg: 'whiteAlpha.50',
              _hover: { bg: 'whiteAlpha.100' },
              _focus: {
                bg: 'transparent',
                borderColor: 'brand.500',
              },
            },
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900',
        _dark: {
          bg: 'gray.900',
          color: 'white',
        },
      },
    },
  },
})

export default theme
