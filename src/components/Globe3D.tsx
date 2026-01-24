import { useRef, useMemo, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

// Aurelia global office locations with coordinates
const locations = [
  { city: "London", lat: 51.5074, lng: -0.1278, flagship: true, timezone: "GMT" },
  { city: "Geneva", lat: 46.2044, lng: 6.1432, flagship: true, timezone: "CET" },
  { city: "Singapore", lat: 1.3521, lng: 103.8198, flagship: true, timezone: "SGT" },
  { city: "Dubai", lat: 25.2048, lng: 55.2708, flagship: false, timezone: "GST" },
  { city: "New York", lat: 40.7128, lng: -74.006, flagship: false, timezone: "EST" },
  { city: "Hong Kong", lat: 22.3193, lng: 114.1694, flagship: false, timezone: "HKT" },
];

// Convert lat/lng to 3D sphere coordinates
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Glowing marker for each city
function CityMarker({ position, city, flagship, isHovered, onHover }: {
  position: THREE.Vector3;
  city: string;
  flagship: boolean;
  isHovered: boolean;
  onHover: (city: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(isHovered ? 1.5 : scale);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(isHovered ? 2.5 : 1.8 + Math.sin(state.clock.elapsedTime * 2) * 0.3);
    }
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial
          color={flagship ? "#D4AF37" : "#B8860B"}
          transparent
          opacity={isHovered ? 0.6 : 0.3}
        />
      </mesh>
      
      {/* Core marker */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(city)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={flagship ? "#FFD700" : "#DAA520"} />
      </mesh>
      
      {/* City label on hover */}
      {isHovered && (
        <Html
          position={[0, 0.08, 0]}
          center
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div className="bg-background/90 backdrop-blur-sm border border-primary/30 rounded px-3 py-1.5 whitespace-nowrap">
            <p className="text-xs font-medium text-foreground">{city}</p>
            {flagship && (
              <p className="text-[10px] text-primary">Flagship Office</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Connection lines between cities
function ConnectionLines({ hoveredCity }: { hoveredCity: string | null }) {
  const lines = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; key: string }[] = [];
    const flagships = locations.filter((l) => l.flagship);
    
    // Connect all flagships to each other
    for (let i = 0; i < flagships.length; i++) {
      for (let j = i + 1; j < flagships.length; j++) {
        const start = latLngToVector3(flagships[i].lat, flagships[i].lng, 1);
        const end = latLngToVector3(flagships[j].lat, flagships[j].lng, 1);
        result.push({ start, end, key: `${flagships[i].city}-${flagships[j].city}` });
      }
    }
    
    // Connect non-flagships to nearest flagship
    locations.filter((l) => !l.flagship).forEach((loc) => {
      const nearestFlagship = flagships[0];
      const start = latLngToVector3(loc.lat, loc.lng, 1);
      const end = latLngToVector3(nearestFlagship.lat, nearestFlagship.lng, 1);
      result.push({ start, end, key: `${loc.city}-${nearestFlagship.city}` });
    });
    
    return result;
  }, []);

  return (
    <>
      {lines.map(({ start, end, key }) => {
        const isHighlighted = hoveredCity && key.includes(hoveredCity);
        // Create curved line points
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(1.15);
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(32);
        
        return (
          <Line
            key={key}
            points={points}
            color={isHighlighted ? "#FFD700" : "#D4AF37"}
            lineWidth={isHighlighted ? 2 : 0.5}
            transparent
            opacity={isHighlighted ? 0.8 : 0.2}
          />
        );
      })}
    </>
  );
}

// Rotating globe with atmosphere
function Globe({ hoveredCity, setHoveredCity }: {
  hoveredCity: string | null;
  setHoveredCity: (city: string | null) => void;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame((state) => {
    if (globeRef.current && !hoveredCity) {
      globeRef.current.rotation.y += 0.001;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005;
    }
  });

  const markers = useMemo(() => 
    locations.map((loc) => ({
      ...loc,
      position: latLngToVector3(loc.lat, loc.lng, 1.01),
    })),
    []
  );

  return (
    <group>
      {/* Globe sphere - lighter base color for visibility */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#2d3748"
          roughness={0.6}
          metalness={0.3}
          transparent
          opacity={0.95}
        />
      </Sphere>
      
      {/* Wireframe overlay - increased visibility */}
      <Sphere args={[1.002, 32, 32]}>
        <meshBasicMaterial
          color="#F5E6B8"
          wireframe
          transparent
          opacity={0.25}
        />
      </Sphere>
      
      {/* Atmosphere glow - brighter */}
      <Sphere ref={atmosphereRef} args={[1.05, 32, 32]}>
        <meshBasicMaterial
          color="#F5E6B8"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* City markers */}
      {markers.map((loc) => (
        <CityMarker
          key={loc.city}
          position={loc.position}
          city={loc.city}
          flagship={loc.flagship}
          isHovered={hoveredCity === loc.city}
          onHover={setHoveredCity}
        />
      ))}
      
      {/* Connection lines */}
      <ConnectionLines hoveredCity={hoveredCity} />
    </group>
  );
}

// Floating particles around globe
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.3 + Math.random() * 0.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        color="#D4AF37"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Main Globe3D component
const Globe3D = () => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="w-full h-[400px] md:h-[500px] relative"
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#F5E6B8" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#87CEEB" />
        <pointLight position={[0, 10, 0]} intensity={0.4} color="#ffffff" />
        
        <Suspense fallback={null}>
          <Globe hoveredCity={hoveredCity} setHoveredCity={setHoveredCity} />
          <FloatingParticles />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!hoveredCity}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI - Math.PI / 4}
        />
      </Canvas>
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, hsl(var(--background)) 100%)',
        }}
      />
    </motion.div>
  );
};

export default Globe3D;
