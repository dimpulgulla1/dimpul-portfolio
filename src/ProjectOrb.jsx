
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function MovingOrb() {
  const group = useRef(null);
  const ringOne = useRef(null);
  const ringTwo = useRef(null);
  const dots = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouse(event) {
      mouse.current.x =
        (event.clientX / window.innerWidth) * 2 - 1;

      mouse.current.y =
        (event.clientY / window.innerHeight) * 2 - 1;
    }

    window.addEventListener("pointermove", handleMouse);

    return () => {
      window.removeEventListener(
        "pointermove",
        handleMouse
      );
    };
  }, []);

  const particlePositions = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * 2.399963;
      const distance = 2.05 + (i % 9) * 0.028;

      positions[i * 3] =
        Math.cos(angle) * radius * distance;

      positions[i * 3 + 1] = y * distance;

      positions[i * 3 + 2] =
        Math.sin(angle) * radius * distance;
    }

    return positions;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;

    // Stronger movement when you move your cursor
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      mouse.current.x * 0.6 +
        Math.sin(time * 0.16) * 0.08,
      2.5,
      delta
    );

    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -mouse.current.y * 0.4 +
        Math.sin(time * 0.14) * 0.04,
      2.5,
      delta
    );

    if (ringOne.current) {
      ringOne.current.rotation.z += delta * 0.2;
    }

    if (ringTwo.current) {
      ringTwo.current.rotation.z -= delta * 0.15;
    }

    if (dots.current) {
      dots.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={group}>
      {/* Central glowing, liquid-like 3D sphere */}
      <Float
        speed={0.7}
        floatIntensity={0.18}
        rotationIntensity={0.08}
      >
        <mesh>
          <sphereGeometry args={[1.35, 64, 64]} />

          <MeshDistortMaterial
            color="#598dff"
            metalness={0.45}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.07}
            distort={0.22}
            speed={1.15}
          />
        </mesh>
      </Float>

      {/* First reflective orbit */}
      <group ref={ringOne} rotation={[0.6, 0.1, 0]}>
        <mesh>
          <torusGeometry args={[1.8, 0.025, 12, 128]} />

          <meshPhysicalMaterial
            color="#91eaff"
            metalness={0.65}
            roughness={0.14}
            clearcoat={1}
            emissive="#217bff"
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>

      {/* Second independently moving ring */}
      <group
        ref={ringTwo}
        rotation={[1.2, 0.45, 0.5]}
      >
        <mesh>
          <torusGeometry args={[1.95, 0.017, 12, 128]} />

          <meshPhysicalMaterial
            color="#9d88ff"
            metalness={0.5}
            roughness={0.2}
            emissive="#5840d8"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Surrounding blue particle globe */}
      <points ref={dots}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#8dd9ff"
          size={0.025}
          sizeAttenuation
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function ProjectOrb() {
  return (
    <div className="dg-orb-canvas" aria-hidden="true">
      <Canvas
        camera={{
          position: [0, 0, 6.8],
          fov: 45,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.5} />

        <directionalLight
          position={[3, 4, 5]}
          intensity={3.5}
          color="#bfe9ff"
        />

        <pointLight
          position={[-3, 2, 3]}
          intensity={28}
          color="#4abfff"
        />

        <pointLight
          position={[3, -2, 2]}
          intensity={22}
          color="#a15cff"
        />

        <MovingOrb />
      </Canvas>
    </div>
  );
}