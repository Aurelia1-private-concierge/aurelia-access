import { useRef, useMemo, Suspense, useState, useCallback, useEffect, Component, ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Error Boundary for WebGL/Three.js errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobeErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Globe3D] WebGL Error:', error, errorInfo);
    logGlobeError('webgl_crash', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[400px] md:h-[500px] flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg border border-primary/20">
          <AlertTriangle className="w-12 h-12 text-primary/60 mb-4" />
          <p className="text-muted-foreground mb-2">Globe visualization unavailable</p>
          <p className="text-xs text-muted-foreground/60 mb-4">WebGL may not be supported</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRetry();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Audit logging helpers
const logGlobeError = async (errorType: string, message: string) => {
  try {
    await supabase.from('audit_logs').insert({
      action: 'globe_error',
      resource_type: 'globe_3d',
      details: { error_type: errorType, message, timestamp: new Date().toISOString() }
    });
  } catch (e) {
    console.warn('[Globe3D] Failed to log error:', e);
  }
};

const logGlobeInteraction = async (action: string, details: Record<string, unknown>) => {
  try {
    await supabase.from('analytics_events').insert({
      event_name: `globe_${action}`,
      event_category: 'globe_interaction',
      event_data: { ...details, timestamp: new Date().toISOString() }
    });
  } catch (e) {
    // Silent fail for analytics
  }
};
// Aurelia global office locations with coordinates and country details
const locations = [{
  city: "London",
  country: "United Kingdom",
  lat: 51.5074,
  lng: -0.1278,
  flagship: true,
  timezone: "GMT",
  details: "European HQ • 24/7 Operations"
}, {
  city: "Geneva",
  country: "Switzerland",
  lat: 46.2044,
  lng: 6.1432,
  flagship: true,
  timezone: "CET",
  details: "Private Banking • Wealth Management"
}, {
  city: "Singapore",
  country: "Singapore",
  lat: 1.3521,
  lng: 103.8198,
  flagship: true,
  timezone: "SGT",
  details: "Asia Pacific HQ • Regional Hub"
}, {
  city: "Dubai",
  country: "UAE",
  lat: 25.2048,
  lng: 55.2708,
  flagship: false,
  timezone: "GST",
  details: "Middle East Operations"
}, {
  city: "New York",
  country: "USA",
  lat: 40.7128,
  lng: -74.006,
  flagship: false,
  timezone: "EST",
  details: "Americas Operations"
}, {
  city: "Hong Kong",
  country: "China",
  lat: 22.3193,
  lng: 114.1694,
  flagship: false,
  timezone: "HKT",
  details: "Greater China Coverage"
}, {
  city: "Monaco",
  country: "Monaco",
  lat: 43.7384,
  lng: 7.4246,
  flagship: false,
  timezone: "CET",
  details: "Luxury Concierge • Events"
}, {
  city: "Tokyo",
  country: "Japan",
  lat: 35.6762,
  lng: 139.6503,
  flagship: false,
  timezone: "JST",
  details: "Japan & Korea Markets"
}];

// Simplified continent outlines (lat/lng coordinates)
const continentOutlines: { name: string; points: [number, number][] }[] = [
  {
    name: "Europe",
    points: [
      [-10, 36], [0, 43], [10, 45], [20, 42], [30, 45], [40, 42], [35, 55], [30, 60], [20, 65], [10, 60], [0, 50], [-10, 44], [-10, 36]
    ]
  },
  {
    name: "Asia",
    points: [
      [40, 42], [50, 40], [60, 35], [70, 25], [80, 20], [90, 25], [100, 20], [110, 22], [120, 30], [130, 35], [140, 40], [145, 45], [140, 55], [130, 60], [110, 55], [90, 50], [70, 55], [50, 55], [40, 42]
    ]
  },
  {
    name: "Africa",
    points: [
      [-15, 30], [0, 35], [10, 35], [20, 32], [35, 30], [40, 20], [50, 12], [45, 0], [40, -10], [35, -25], [30, -35], [20, -35], [15, -30], [12, -20], [5, -5], [-5, 5], [-15, 15], [-20, 20], [-15, 30]
    ]
  },
  {
    name: "NorthAmerica",
    points: [
      [-170, 65], [-160, 70], [-140, 70], [-120, 75], [-100, 75], [-80, 70], [-60, 65], [-75, 55], [-80, 45], [-85, 30], [-100, 25], [-110, 30], [-120, 35], [-125, 45], [-130, 55], [-145, 60], [-170, 65]
    ]
  },
  {
    name: "SouthAmerica",
    points: [
      [-80, 10], [-75, 5], [-70, -5], [-75, -15], [-70, -25], [-65, -40], [-70, -55], [-75, -50], [-80, -40], [-80, -30], [-75, -20], [-80, -5], [-80, 10]
    ]
  },
  {
    name: "Australia",
    points: [
      [115, -20], [125, -15], [135, -12], [145, -15], [150, -25], [150, -35], [145, -40], [135, -35], [125, -35], [115, -30], [115, -20]
    ]
  }
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
function CityMarker({
  position,
  city,
  country,
  flagship,
  timezone,
  details,
  isHovered,
  onHover
}: {
  position: THREE.Vector3;
  city: string;
  country: string;
  flagship: boolean;
  timezone: string;
  details: string;
  isHovered: boolean;
  onHover: (city: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(state => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.setScalar(isHovered ? 1.5 : scale);
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(isHovered ? 2.5 : 1.8 + Math.sin(state.clock.elapsedTime * 2) * 0.3);
    }
  });
  return <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={flagship ? "#D4AF37" : "#B8860B"} transparent opacity={isHovered ? 0.6 : 0.3} />
      </mesh>
      
      {/* Core marker */}
      <mesh ref={meshRef} onPointerEnter={() => onHover(city)} onPointerLeave={() => onHover(null)}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={flagship ? "#FFD700" : "#DAA520"} />
      </mesh>
      
      {/* City label on hover - Enhanced with country details */}
      {isHovered && <Html position={[0, 0.12, 0]} center style={{
      pointerEvents: "none",
      userSelect: "none"
    }}>
          <div className="bg-background/95 backdrop-blur-md border border-primary/40 rounded-lg px-4 py-2.5 whitespace-nowrap shadow-lg min-w-[160px]">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${flagship ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
              <p className="text-sm font-semibold text-foreground">{city}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{country}</p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80">
              <span className="font-mono">{timezone}</span>
              <span>•</span>
              <span>{details}</span>
            </div>
            {flagship && (
              <div className="mt-1.5 pt-1.5 border-t border-primary/20">
                <p className="text-[10px] text-primary font-medium">★ Flagship Office</p>
              </div>
            )}
          </div>
        </Html>}
    </group>;
}

// Connection lines between cities
function ConnectionLines({
  hoveredCity
}: {
  hoveredCity: string | null;
}) {
  const lines = useMemo(() => {
    const result: {
      start: THREE.Vector3;
      end: THREE.Vector3;
      key: string;
    }[] = [];
    const flagships = locations.filter(l => l.flagship);

    // Connect all flagships to each other
    for (let i = 0; i < flagships.length; i++) {
      for (let j = i + 1; j < flagships.length; j++) {
        const start = latLngToVector3(flagships[i].lat, flagships[i].lng, 1);
        const end = latLngToVector3(flagships[j].lat, flagships[j].lng, 1);
        result.push({
          start,
          end,
          key: `${flagships[i].city}-${flagships[j].city}`
        });
      }
    }

    // Connect non-flagships to nearest flagship
    locations.filter(l => !l.flagship).forEach(loc => {
      const nearestFlagship = flagships[0];
      const start = latLngToVector3(loc.lat, loc.lng, 1);
      const end = latLngToVector3(nearestFlagship.lat, nearestFlagship.lng, 1);
      result.push({
        start,
        end,
        key: `${loc.city}-${nearestFlagship.city}`
      });
    });
    return result;
  }, []);
  return <>
      {lines.map(({
      start,
      end,
      key
    }) => {
      const isHighlighted = hoveredCity && key.includes(hoveredCity);
      // Create curved line points
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1.15);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(32);
      return <Line key={key} points={points} color={isHighlighted ? "#FFD700" : "#D4AF37"} lineWidth={isHighlighted ? 2 : 0.5} transparent opacity={isHighlighted ? 0.8 : 0.2} />;
    })}
    </>;
}

// Rotating globe with atmosphere
function Globe({
  hoveredCity,
  setHoveredCity
}: {
  hoveredCity: string | null;
  setHoveredCity: (city: string | null) => void;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const {
    camera
  } = useThree();
  useFrame(state => {
    if (globeRef.current) {
      // Continuous slow rotation - slightly faster for visibility
      globeRef.current.rotation.y += hoveredCity ? 0.0005 : 0.002;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.001;
    }
  });
  const markers = useMemo(() => locations.map(loc => ({
    ...loc,
    position: latLngToVector3(loc.lat, loc.lng, 1.01)
  })), []);
  // Generate continent outline points
  const continentLines = useMemo(() => {
    return continentOutlines.map(continent => {
      const points = continent.points.map(([lng, lat]) => 
        latLngToVector3(lat, lng, 1.005)
      );
      return { name: continent.name, points };
    });
  }, []);

  return <group>
      {/* Globe sphere - lighter base color for visibility */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshStandardMaterial color="#1a1f2e" roughness={0.7} metalness={0.2} transparent opacity={0.98} />
      </Sphere>
      
      {/* Continent outlines */}
      {continentLines.map(({ name, points }) => (
        <Line 
          key={name}
          points={points}
          color="#D4AF37"
          lineWidth={1.5}
          transparent
          opacity={0.6}
        />
      ))}
      
      {/* Latitude lines (graticule) */}
      {[-60, -30, 0, 30, 60].map(lat => {
        const points = [];
        for (let lng = 0; lng <= 360; lng += 10) {
          points.push(latLngToVector3(lat, lng - 180, 1.003));
        }
        return (
          <Line 
            key={`lat-${lat}`}
            points={points}
            color="#F5E6B8"
            lineWidth={0.5}
            transparent
            opacity={0.15}
          />
        );
      })}
      
      {/* Longitude lines */}
      {[0, 30, 60, 90, 120, 150, 180, -30, -60, -90, -120, -150].map(lng => {
        const points = [];
        for (let lat = -80; lat <= 80; lat += 10) {
          points.push(latLngToVector3(lat, lng, 1.003));
        }
        return (
          <Line 
            key={`lng-${lng}`}
            points={points}
            color="#F5E6B8"
            lineWidth={0.5}
            transparent
            opacity={0.15}
          />
        );
      })}
      
      {/* Atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[1.06, 32, 32]}>
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.08} side={THREE.BackSide} />
      </Sphere>
      
      {/* City markers */}
      {markers.map(loc => <CityMarker key={loc.city} position={loc.position} city={loc.city} country={loc.country} flagship={loc.flagship} timezone={loc.timezone} details={loc.details} isHovered={hoveredCity === loc.city} onHover={setHoveredCity} />)}
      
      {/* Connection lines */}
      <ConnectionLines hoveredCity={hoveredCity} />
    </group>;
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
  useFrame(state => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  return <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.008} color="#D4AF37" transparent opacity={0.4} sizeAttenuation />
    </points>;
}

// Main Globe3D component with error handling and audit
const Globe3D = () => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const interactionStartRef = useRef<number | null>(null);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
        logGlobeError('webgl_unsupported', 'WebGL not available in browser');
      }
    } catch (e) {
      setIsWebGLSupported(false);
      logGlobeError('webgl_check_failed', String(e));
    }
  }, []);

  // Audit: Track hover interactions with debounce
  const handleCityHover = useCallback((city: string | null) => {
    if (city && !hoveredCity) {
      interactionStartRef.current = Date.now();
    } else if (!city && hoveredCity && interactionStartRef.current) {
      const duration = Date.now() - interactionStartRef.current;
      logGlobeInteraction('city_hover', { 
        city: hoveredCity, 
        duration_ms: duration,
        is_flagship: locations.find(l => l.city === hoveredCity)?.flagship || false
      });
      interactionStartRef.current = null;
    }
    setHoveredCity(city);
  }, [hoveredCity]);

  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1);
    logGlobeInteraction('retry_attempt', { retry_count: retryKey + 1 });
  }, [retryKey]);

  // Fallback for unsupported WebGL
  if (!isWebGLSupported) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-[400px] md:h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 rounded-lg border border-primary/20"
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Global Presence</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our offices span {locations.length} cities across {new Set(locations.map(l => l.country)).size} countries
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {locations.filter(l => l.flagship).map(loc => (
              <div key={loc.city} className="px-3 py-2 bg-primary/5 rounded-md">
                <span className="text-primary">★</span> {loc.city}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <GlobeErrorBoundary onRetry={handleRetry}>
      <motion.div
        key={retryKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full h-[320px] md:h-[400px] relative"
      >
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: true }}
          onCreated={() => {
            logGlobeInteraction('canvas_loaded', { timestamp: new Date().toISOString() });
          }}
          className="text-gold-light"
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#F5E6B8" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#87CEEB" />
          <pointLight position={[0, 10, 0]} intensity={0.4} color="#ffffff" />

          <Suspense fallback={null}>
            <Globe hoveredCity={hoveredCity} setHoveredCity={handleCityHover} />
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
            background: 'radial-gradient(circle at center, transparent 40%, hsl(var(--background)) 100%)'
          }}
        />
      </motion.div>
    </GlobeErrorBoundary>
  );
};

export default Globe3D;