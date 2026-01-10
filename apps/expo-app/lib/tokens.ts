export const tokens = {
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
  },
  typography: {
    families: {
      sans: "System",
      mono: "Menlo",
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
    lineHeights: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 30,
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },
} as const

export const lightTheme = {
  ...tokens,
  colors: {
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(240, 10%, 3.9%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(240, 10%, 3.9%)",
    popover: "hsl(0, 0%, 100%)",
    popoverForeground: "hsl(240, 10%, 3.9%)",
    primary: "hsl(240, 5.9%, 10%)",
    primaryForeground: "hsl(0, 0%, 98%)",
    secondary: "hsl(240, 4.8%, 95.9%)",
    secondaryForeground: "hsl(240, 5.9%, 10%)",
    muted: "hsl(240, 4.8%, 95.9%)",
    mutedForeground: "hsl(240, 3.8%, 46.1%)",
    accent: "hsl(240, 4.8%, 95.9%)",
    accentForeground: "hsl(240, 5.9%, 10%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    destructiveForeground: "hsl(0, 0%, 98%)",
    border: "hsl(240, 5.9%, 90%)",
    input: "hsl(240, 5.9%, 90%)",
    ring: "hsl(240, 10%, 3.9%)",
  },
} as const

export const darkTheme = {
  ...tokens,
  colors: {
    background: "hsl(240, 10%, 3.9%)",
    foreground: "hsl(0, 0%, 98%)",
    card: "hsl(240, 10%, 3.9%)",
    cardForeground: "hsl(0, 0%, 98%)",
    popover: "hsl(240, 10%, 3.9%)",
    popoverForeground: "hsl(0, 0%, 98%)",
    primary: "hsl(0, 0%, 98%)",
    primaryForeground: "hsl(240, 5.9%, 10%)",
    secondary: "hsl(240, 3.7%, 15.9%)",
    secondaryForeground: "hsl(0, 0%, 98%)",
    muted: "hsl(240, 3.7%, 15.9%)",
    mutedForeground: "hsl(240, 5%, 64.9%)",
    accent: "hsl(240, 3.7%, 15.9%)",
    accentForeground: "hsl(0, 0%, 98%)",
    destructive: "hsl(0, 62.8%, 30.6%)",
    destructiveForeground: "hsl(0, 0%, 98%)",
    border: "hsl(240, 3.7%, 15.9%)",
    input: "hsl(240, 3.7%, 15.9%)",
    ring: "hsl(240, 4.9%, 83.9%)",
  },
} as const

export type Theme = {
  radius: typeof tokens.radius
  typography: typeof tokens.typography
  spacing: typeof tokens.spacing
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
  }
}

export function space(value: number): number {
  return value * 4
}
