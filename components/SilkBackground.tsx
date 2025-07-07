'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { forwardRef, useRef, useMemo, useLayoutEffect } from 'react'
import { Color } from 'three'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

const hexToNormalizedRGB = (hex: string) => {
  hex = hex.replace('#', '')
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ]
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 0.8; // Increase opacity for more visible background effect
  gl_FragColor = col;
}
`

interface SilkPlaneProps {
  uniforms: Record<string, { value: unknown }>
}

const SilkPlane = forwardRef<THREE.Mesh, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree()

  useLayoutEffect(() => {
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1)
    }
  }, [ref, viewport])

  useFrame((_, delta) => {
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.material.uniforms.uTime.value += 0.1 * delta
    }
  })

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
      />
    </mesh>
  )
})

SilkPlane.displayName = 'SilkPlane'

export default function SilkBackground() {
  const meshRef = useRef()
  const { theme, systemTheme } = useTheme()

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Choose colors based on theme - light green palette
  const lightGreenColor = '#4ADE80' // Light green for light theme
  const darkGreenColor = '#22C55E' // Slightly darker green for dark theme

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: 3 }, // Slower, more elegant movement
      uScale: { value: 1.5 }, // Slightly larger scale for better coverage
      uNoiseIntensity: { value: 0.8 }, // Reduced noise for cleaner look
      uColor: {
        value: new Color(...hexToNormalizedRGB(isDark ? darkGreenColor : lightGreenColor)),
      },
      uRotation: { value: 0.1 }, // Slight rotation for more dynamic feel
      uTime: { value: 0 },
    }),
    [isDark]
  )

  return (
    <div className="fixed inset-0 -z-10 h-full w-full" style={{ pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <SilkPlane ref={meshRef} uniforms={uniforms} />
      </Canvas>
    </div>
  )
}
