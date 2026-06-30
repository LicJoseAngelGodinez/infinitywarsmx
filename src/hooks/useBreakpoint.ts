import { useState, useEffect } from 'react'

const BREAKPOINTS = {
  xsm:  320,
  sm:   576,
  md:   768,
  lg:   992,
  xlg:  1200,
  xxlg: 1400,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm)   return 'xsm'
  if (width < BREAKPOINTS.md)   return 'sm'
  if (width < BREAKPOINTS.lg)   return 'md'
  if (width < BREAKPOINTS.xlg)  return 'lg'
  if (width < BREAKPOINTS.xxlg) return 'xlg'
  return 'xxlg'
}

export function useBreakpoint() {
  const [bp, setBp] = useState<Breakpoint>(() => getBreakpoint(window.innerWidth))

  useEffect(() => {
    const handler = () => setBp(getBreakpoint(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return {
    breakpoint: bp,
    isMobile:  bp === 'xsm' || bp === 'sm',
    isTablet:  bp === 'md',
    isDesktop: bp === 'lg' || bp === 'xlg' || bp === 'xxlg',
  }
}
