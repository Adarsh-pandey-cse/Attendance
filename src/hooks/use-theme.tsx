"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props} themes={['light', 'dark', 'radha-rani']}>{children}</NextThemesProvider>
}

import { useTheme as useNextTheme } from 'next-themes'

export function useTheme() {
    const { theme, setTheme, systemTheme } = useNextTheme()
    const currentTheme = theme === 'system' ? systemTheme : theme;
    return { theme: currentTheme || 'dark', setTheme }
}
