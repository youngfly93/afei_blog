'use client'

import TrueFocus from './TrueFocus'
import './TrueFocusCard.css'

interface TrueFocusCardProps {
  className?: string
}

export default function TrueFocusCard({ className = '' }: TrueFocusCardProps) {
  return (
    <div className={`truefocus-simple ${className}`}>
      <TrueFocus
        sentence="Hello Afei"
        manualMode={false}
        blurAmount={2}
        borderColor="#0f4c3a"
        glowColor="rgba(15, 76, 58, 0.6)"
        animationDuration={1.2}
        pauseBetweenAnimations={2.5}
      />
    </div>
  )
}
