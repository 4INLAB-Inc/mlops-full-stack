import { Button, ButtonProps, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface QuickActionButtonProps extends Omit<ButtonProps, 'children'> {
  icon: IconType
  label: string
  onClick?: () => void
}

export function QuickActionButton({
  icon,
  label,
  onClick,
  isLoading,
  bg,
  ...props
}: QuickActionButtonProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('brand.500', 'white')
  const iconColor = useColorModeValue('point.500', 'point.200')
  const hoverBg = useColorModeValue('point.50', 'point.900')
  const hoverBorderColor = useColorModeValue('point.500', 'point.200')
  const activeBg = useColorModeValue('point.100', 'point.800')

  return (
    <Button
      as={VStack}
      variant="outline"
      height="auto"
      py={4}
      px={6}
      spacing={3}
      rounded="xl"
      borderWidth={2}
      borderColor={borderColor}
      bg={bg}
      onClick={onClick}
      isLoading={isLoading}
      role="group"
      _hover={{
        bg: hoverBg,
        borderColor: hoverBorderColor,
        transform: 'translateY(-2px)',
        shadow: 'md',
      }}
      _active={{
        bg: activeBg,
        transform: 'translateY(0)',
      }}
      transition="all 0.2s"
      {...props}
    >
      <Icon
        as={icon}
        boxSize={7}
        color={iconColor}
        transition="all 0.2s"
        _groupHover={{
          color: hoverBorderColor,
          transform: 'scale(1.1)',
        }}
      />
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color={textColor}
        transition="color 0.2s"
        _groupHover={{ color: hoverBorderColor }}
      >
        {label}
      </Text>
    </Button>
  )
}
