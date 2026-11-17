
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import * as THREE from "three";
import "./PortfolioProjects.css";

function ParticleGlobe({ progress }) {
  const globe = useRef(null);
  const material = useRef(null);

  const positions = useMemo(() => {
    const count = 2400;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const y = 1 - (2 * (i + 0.5)) / count;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * 2.399963229728653;

      array[i * 3] = Math.cos(angle) * radius * 1.45;
      array[i * 3 + 1] = y * 1.45;
      array[i * 3 + 2] = Math.sin(angle) * radius * 1.45;
    }

    return array;
  }, []);

  useFrame((state, delta) => {
    if (!globe.current) return;

    const value = progress.current;
    const time = state.clock.elapsedTime;

    globe.current.rotation.y += delta * 0.24;
    globe.current.rotation.x =
      Math.sin(time * 0.35) * 0.14;

    // Sphere grows and moves toward the right
    globe.current.position.x =
      THREE.MathUtils.lerp(0, 3.4, value);

    globe.current.position.z =
      THREE.MathUtils.lerp(0, 1.4, value);

    const scale =
      THREE.MathUtils.lerp(0.65, 3.2, value);

    globe.current.scale.setScalar(scale);

    if (material.current) {
      material.current.color.setRGB(
        THREE.MathUtils.lerp(0.68, 0.18, value),
        THREE.MathUtils.lerp(0.85, 0.36, value),
        1
      );
    }
  });

  return (
    <points ref={globe}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={material}
        color="#9acbff"
        size={0.023}
        sizeAttenuation
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleTransition({
  onReveal,
  onFinish,
}) {
  const overlayRef = useRef(null);
  const progress = useRef(0);
  const revealRef = useRef(onReveal);
  const finishRef = useRef(onFinish);

  revealRef.current = onReveal;
  finishRef.current = onFinish;

  useEffect(() => {
    const overlay = overlayRef.current;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      revealRef.current();
      finishRef.current();
      return;
    }

    const animation = { value: 0 };

    const timeline = gsap.timeline({
      onComplete: () => finishRef.current(),
    });

    timeline
      .fromTo(
        overlay,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
        }
      )
      .to(animation, {
        value: 1,
        duration: 1.7,
        ease: "power3.inOut",
        onUpdate: () => {
          progress.current = animation.value;
        },
      })
      .add(() => revealRef.current(), "-=0.3")
      .to(overlay, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
      });

    return () => timeline.kill();
  }, []);

  return (
    <div
      ref={overlayRef}
      className="dg-particle-transition"
      aria-hidden="true"
    >
      <div className="dg-transition-glow" />

      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 45,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <ParticleGlobe progress={progress} />
      </Canvas>

      <div className="dg-transition-caption">
        ENTERING SELECTED WORK
        <span> / 001</span>
      </div>
    </div>
  );
}