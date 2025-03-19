import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

export const customCardStyle = defineStyleConfig({
  baseStyle: {
    container: {
      borderRadius: 'lg',
      boxShadow: 'sm',
      transition: 'all 0.2s',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      },
    },
  },
  variants: {
    elevated: {
      container: {
        bg: 'white',
        _dark: {
          bg: 'gray.700',
        },
      },
    },
    solid: {
      container: {
        bg: 'gray.50',
        _dark: {
          bg: 'gray.800',
        },
      },
    },
  },
  defaultProps: {
    variant: 'elevated',
  },
})

export const customStatStyle = defineStyleConfig({
  baseStyle: {
    container: {
      px: '4',
      py: '2',
    },
    label: {
      fontSize: 'sm',
      fontWeight: 'medium',
      color: 'gray.600',
      _dark: {
        color: 'gray.400',
      },
    },
    number: {
      fontSize: '2xl',
      fontWeight: 'bold',
      color: 'gray.900',
      _dark: {
        color: 'white',
      },
    },
    helpText: {
      fontSize: 'sm',
      color: 'gray.600',
      _dark: {
        color: 'gray.400',
      },
    },
  },
})

export const customTabStyle = defineStyleConfig({
  variants: {
    enclosed: {
      tab: {
        _selected: {
          color: 'blue.600',
          borderColor: 'blue.600',
          borderBottomColor: 'transparent',
          _dark: {
            color: 'blue.200',
            borderColor: 'blue.200',
          },
        },
      },
    },
  },
})
