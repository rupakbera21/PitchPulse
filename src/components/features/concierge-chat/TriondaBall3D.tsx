import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

export function TriondaBall3D({ cloneId = '' }: { cloneId?: string }) {
  const { scene } = useGLTF('/Trionda2026.glb' + (cloneId ? `?id=${cloneId}` : ''));
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (group.current) {
      // Continuous smooth rotation to prevent jumping when re-mounting
      group.current.rotation.y -= delta * 1.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={group}>
        <primitive object={scene} scale={1.2} position={[0, 0, 0]} />
      </group>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </Float>
  );
}

// Preload the model so it renders instantly
useGLTF.preload('/Trionda2026.glb');
