'use client'

import { useTheme } from 'next-themes'
import DotGrid from './DotGrid'

export default function DotGridBackground() {
  const { theme, systemTheme } = useTheme()

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Choose green colors based on theme
  const lightGreenBase = '#22C55E' // Green-500
  const lightGreenActive = '#4ADE80' // Green-400
  const darkGreenBase = '#16A34A' // Green-600
  const darkGreenActive = '#22C55E' // Green-500

  return (
    <div className="fixed inset-0 -z-10 h-full w-full" style={{ pointerEvents: 'none' }}>
      <DotGrid
        dotSize={8}
        gap={25}
        baseColor={isDark ? darkGreenBase : lightGreenBase}
        activeColor={isDark ? darkGreenActive : lightGreenActive}
        proximity={120}
        speedTrigger={80}
        shockRadius={200}
        shockStrength={4}
        maxSpeed={4000}
        resistance={600}
        returnDuration={1.2}
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  )
}
