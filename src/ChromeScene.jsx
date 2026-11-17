
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

const COUNT = 3200;

function ChromeSculpture({ morphProgress, targetRef }) {
  const group = useRef(null);
  const chrome = useRef(null);
  const particles = useRef(null);
  const particleMaterial = useRef(null);
  const target = useRef(new THREE.Vector2());

  const particleData = useMemo(() => {
    const geometry = new THREE.TorusKnotGeometry(
      1, 0.36, 180, 24, 2, 3
    );

    const source = geometry.attributes.position;
    const start = new Float32Array(COUNT * 3);
    const end = new Float32Array(COUNT * 3);
    const current = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    const blue = new THREE.Color("#438fff");
    const cyan = new THREE.Color("#b7efff");

    for (let i = 0; i < COUNT; i++) {
      const offset = i * 3;
      const index = (i * 73) % source.count;

      start[offset] = source.getX(index) * 1.55;
      start[offset + 1] = source.getY(index) * 1.55;
      start[offset + 2] = source.getZ(index) * 1.55;

      const y = 1 - 2 * (i + 0.5) / COUNT;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * 2.399963229728653;

      end[offset] = Math.cos(angle) * radius * 1.8;
      end[offset + 1] = y * 1.8;
      end[offset + 2] = Math.sin(angle) * radius * 1.8;

      const color = blue.clone().lerp(
        cyan,
        (Math.sin(i * 0.47) + 1) / 2
      );

      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }

    current.set(start);
    geometry.dispose();

    return { start, end, current, colors };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const x =
        (event.clientX / window.innerWidth) * 2 - 1;

      const y =
        (event.clientY / window.innerHeight) * 2 - 1;

      target.current.set(-y * 0.35, x * 0.45);
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const progress = THREE.MathUtils.clamp(
      morphProgress.current.value,
      0,
      1
    );

    const smooth = progress * progress *
      (3 - 2 * progress);

    const travel = THREE.MathUtils.smoothstep(
      progress,
      0.6,
      1
    );

    const time = state.clock.elapsedTime;

    // Original swinging behavior on the homepage.
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      target.current.x * (1 - travel),
      2,
      delta
    );

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      target.current.y * (1 - travel),
      2,
      delta
    );

    group.current.rotation.z += delta * 0.09;
    group.current.rotation.y += delta * smooth * 0.2;

    // Find the center of the actual Voice Assistant ball.
    const element = targetRef.current;

    let destinationX = 0;
    let destinationY = 0;
    let destinationScale = 0.6;

    if (element) {
      const rect = element.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const camera = state.camera;

      // Perspective viewport size at the object's depth.
      const distance = Math.abs(camera.position.z);
      const fov =
        THREE.MathUtils.degToRad(camera.fov);

      const worldHeight =
        2 * Math.tan(fov / 2) * distance;

      const worldWidth =
        worldHeight * state.size.width /
        state.size.height;

      destinationX =
        (centerX / state.size.width - 0.5) *
        worldWidth;

      destinationY =
        (0.5 - centerY / state.size.height) *
        worldHeight;

      // Make the final particle sphere match the ball.
      const pixelsPerWorldUnit =
        state.size.height / worldHeight;

      destinationScale =
        Math.min(
          1,
          rect.width / (3.6 * pixelsPerWorldUnit)
        );
    }

    // Smooth travel into the project visual.
    group.current.position.x =
      THREE.MathUtils.lerp(
        0, destinationX, travel
      );

    group.current.position.y =
      THREE.MathUtils.lerp(
        0, destinationY, travel
      );

    group.current.scale.setScalar(
      THREE.MathUtils.lerp(
        1,
        destinationScale,
        travel
      )
    );

    // Fade chrome into particles.
    if (chrome.current) {
      chrome.current.opacity =
        1 - THREE.MathUtils.smoothstep(
          progress, 0.04, 0.65
        );

      chrome.current.depthWrite =
        progress < 0.2;
    }

    // Particles disappear only as the project
    // ball takes over at the end of the journey.
    if (particleMaterial.current) {
      const appearing = THREE.MathUtils.smoothstep(
        progress, 0.04, 0.48
      );

      const disappearing =
        1 - THREE.MathUtils.smoothstep(
          progress, 0.84, 1
        );

      particleMaterial.current.opacity =
        appearing * disappearing * 0.95;
    }

    // Transform points sampled from the spiral
    // into a round particle formation.
    if (particles.current && progress > 0) {
      const attribute =
        particles.current.geometry.attributes.position;

      const array = attribute.array;
      const start = particleData.start;
      const end = particleData.end;

      for (let i = 0; i < COUNT; i++) {
        const offset = i * 3;

        const ripple =
          Math.sin(time * 3 + i * 0.12) *
          0.14 *
          Math.sin(Math.PI * smooth);

        const drift =
          Math.sin(i * 0.37 + time * 1.4) *
          0.035 *
          smooth;

        array[offset] =
          THREE.MathUtils.lerp(
            start[offset],
            end[offset],
            smooth
          ) + ripple;

        array[offset + 1] =
          THREE.MathUtils.lerp(
            start[offset + 1],
            end[offset + 1],
            smooth
          ) + drift;

        array[offset + 2] =
          THREE.MathUtils.lerp(
            start[offset + 2],
            end[offset + 2],
            smooth
          ) + ripple * 0.5;
      }

      attribute.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <Float
        speed={1.5}
        rotationIntensity={0.15}
        floatIntensity={0.35}
      >
        <mesh scale={1.55}>
          <torusKnotGeometry
            args={[1, 0.36, 180, 24, 2, 3]}
          />

          <meshPhysicalMaterial
            ref={chrome}
            color="#d8dde0"
            metalness={1}
            roughness={0.07}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={2.5}
            transparent
            opacity={1}
          />
        </mesh>

        <points ref={particles}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particleData.current, 3]}
              usage={THREE.DynamicDrawUsage}
            />

            <bufferAttribute
              attach="attributes-color"
              args={[particleData.colors, 3]}
            />
          </bufferGeometry>

          <pointsMaterial
            ref={particleMaterial}
            vertexColors
            size={0.035}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </Float>
    </group>
  );
}

export default function ChromeScene({
  morphProgress,
  targetRef,
  mode,
}) {
  const hidden = mode === "project";
  const changing =
    mode === "enter" || mode === "exit";

  return (
    <div
      className="chrome-scene"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        zIndex: changing ? 30 : 0,
        opacity: hidden ? 0 : 1,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 6.5],
          fov: 45,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{
          background: "transparent",
        }}
      >
        <ambientLight intensity={0.8} />

        <directionalLight
          position={[4, 5, 5]}
          intensity={4}
          color="#ffffff"
        />

        <pointLight
          position={[-4, 2, 3]}
          intensity={30}
          color="#b8ff65"
        />

        <pointLight
          position={[3, -3, 2]}
          intensity={18}
          color="#a1b7ff"
        />

        <Environment preset="studio" />

        <ChromeSculpture
          morphProgress={morphProgress}
          targetRef={targetRef}
        />
      </Canvas>
    </div>
  );
}