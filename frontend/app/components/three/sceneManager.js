"use client";
import * as THREE from 'three';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {useState} from 'react';
//testing RN, will update this by using actual data from supabase
export const logs = [
  { type: "error", severity: 3, timestamp: 1690000000, ip: "1.2.3.4" },
  { type: "info", severity: 1, timestamp: 1690000500, ip: "5.6.7.8" },
  { type: "warning", severity: 2, timestamp: 1690001000, ip: "9.10.11.12" },
];
function getGeometry(type, severity) {
  switch (type) {
    case "error":
      return <sphereGeometry args={[0.5 * severity, 32, 32]} />;
    case "info":
      return <boxGeometry args={[1 * severity, 1 * severity, 1 * severity]} />;
    case "warning":
      return <coneGeometry args={[0.5 * severity, 1 * severity, 32]} />;
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}
function getHeatColor(severity) {
  switch (severity) {
    case 1: return "blue";     
    case 2: return "yellow";   
    case 3: return "red";      
    default: return "gray";
  }
}

function getColor(type) {
  switch (type) {
    case "error": return "red";
    case "info": return "blue";
    case "warning": return "yellow";
    default: return "white";
  }
}

export default function SceneManager() {
    const [hoveredIndex,setHoveredIndex] = useState(null);
    const [selectedLog,setSelectedLog] = useState(null);
    const [time,setTime] = useState(0);
  return (

    <div className="w-full h-full">
             {selectedLog && (
        <div className="absolute top-5 left-5 bg-black text-white p-3 rounded opacity-80 z-10">
          <p><strong>User:</strong> {selectedLog.userid || "N/A"}</p>
          <p><strong>Type:</strong> {selectedLog.type}</p>
          <p><strong>Severity:</strong> {selectedLog.severity}</p>
          <p><strong>IP:</strong> {selectedLog.ip}</p>
          <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
        </div>)}
    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10 w-1/2">
    <input
      type="range"
      min={0}
      max={logs.length - 1}
      value={time}
      onChange={(e) => setTime(Number(e.target.value))}
      className="w-full"
    />
  </div>
    
      
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />
        {logs.map((log, idx) => (
                <mesh
                    key={idx}
                    position={[idx * 2 - 2, -2, 0]} 
                    rotation={[-Math.PI / 2, 0, 0]}   
                >
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshStandardMaterial
                    color={getHeatColor(log.severity)}
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                    />
                </mesh>
        ))}

        {logs.map((log, idx) => (
                <mesh 
                key={idx} 
                visible={idx <= time}
                position={[idx * 2 - 2, 0, 0]}
                scale ={hoveredIndex==idx?[1.5,1.5,1.5]:[1,1,1]} 
                onPointerOver ={()=>setHoveredIndex(idx)}
                onPointerOut={()=>setHoveredIndex(null)}
                onClick ={()=>setSelectedLog(log)}>
                    {getGeometry(log.type, log.severity)}
                    <meshStandardMaterial color={getColor(log.type)} />
                </mesh>
        ))}
      </Canvas>
    </div>
  );
}

