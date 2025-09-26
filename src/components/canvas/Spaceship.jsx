import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import CanvasLoader from "../Loader";


const Spaceship = ({ isMobile }) => {
  const spaceship = useGLTF("./battle_cruiser/battle_cruiser.glb");

  return (
    <mesh>
      <primitive
        object={spaceship.scene}
        scale={isMobile ? 0.022 : 0.044}
        position={isMobile ? [0, -2, -0.26] : [0, -1, -1]}
        rotation={isMobile ? [0, -0.80, -0.12] : [0, -1.58, -0.12]}
      />

      <hemisphereLight intensity={1} skyColor="white" groundColor="white" />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={3} />
      <directionalLight position={[-5, 10, -5]} intensity={2} />

      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={10}
        color="#ffffff"
        shadow-mapSize={1024}
      />
      
      <pointLight position={[5, 5, 5]} intensity={5} />

    </mesh>
  );
};

const SpaceshipCanvas = () => {
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
      frameloop='demand'
      shadows
      dpr={[1, 3]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Spaceship isMobile={isMobile} />
        
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default SpaceshipCanvas;