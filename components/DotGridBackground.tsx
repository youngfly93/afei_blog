'use client'

import { useTheme } from 'next-themes'
import DotGrid from './DotGrid'

export default function DotGridBackground() {
  const { theme, systemTheme } = useTheme()

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Choose colors based on theme
  // Base color is white/light gray for visibility
  const lightBaseColor = '#ffffff' // White
  const darkBaseColor = '#e5e7eb' // Gray-200

  // Active color matches the primary theme green
  const lightActiveColor = '#0f4c3a' // Primary-700 (dark green)
  const darkActiveColor = '#10b981' // Emerald-500 (bright green for dark mode)

  return (
    <div className="fixed inset-0 -z-10 h-full w-full" style={{ pointerEvents: 'none' }}>
      <DotGrid
        dotSize={8}
        gap={25}
        baseColor={isDark ? darkBaseColor : lightBaseColor}
        activeColor={isDark ? darkActiveColor : lightActiveColor}
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
