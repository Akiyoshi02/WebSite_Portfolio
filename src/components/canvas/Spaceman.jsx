import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, useAnimations } from "@react-three/drei";

import CanvasLoader from "../Loader";

const Spaceman = ({ isMobile }) => {
  const spaceman = useGLTF("./mercenary_astronaut/mercenary_astronaut.glb");
  const { animations } = spaceman;
  const { actions } = useAnimations(animations, spaceman.scene);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const animationNames = Object.keys(actions);
      const firstAnimation = actions[animationNames[0]];
      if (firstAnimation) {
        firstAnimation.play();
      }
    }
  }, [actions]);

  return (
    <primitive
      object={spaceman.scene}
      scale={0.85}
      position={isMobile ? [0, -1, 0] : [0, -1.2, 0.2]}
      rotation-y={-0.5}
    />
  );
};

const SpacemanCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        physicallyCorrectLights: true,
        toneMappingExposure: 1.2,
      }}
      camera={{
        fov: 20,
        near: 0.1,
        far: 200,
        position: [-4, 2, 6],
      }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />

        <ambientLight intensity={0.3} />
        <hemisphereLight intensity={0.6} groundColor="black" />
        <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
        <directionalLight position={[-5, 10, -5]} intensity={1.5} />

        <Spaceman isMobile={isMobile} />

        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default SpacemanCanvas;
