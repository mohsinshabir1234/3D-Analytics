"use client";
import * as THREE from 'three';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {useState,useEffect} from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function getGeometry(level, severity) {
  switch (level) {
    case "ERROR":
      return <sphereGeometry args={[0.5 * severity, 32, 32]} />;
    case "INFO":
      return <boxGeometry args={[1 * severity, 1 * severity, 1 * severity]} />;
    case "WARNING":
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
    case "ERROR": return "red";
    case "INFO": return "blue";
    case "WARNING": return "yellow";
    default: return "white";
  }
}

export default function SceneManager() {
    const [logs,setLogs] = useState([]);
    const [hoveredIndex,setHoveredIndex] = useState(null);
    const [selectedLog,setSelectedLog] = useState(null);
    const [time,setTime] = useState(0);
    console.log("before useEffect,", process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    useEffect(() => {
  console.log("I am in useEffect")

  // Connect to WebSocket server
  const ws = new WebSocket("ws://localhost:4000"); // or ws://ws-server:8080 in Docker

  ws.onopen = () => console.log("Connected to WebSocket server");

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch(msg.type) {
      case 'log_stats_update':
        setLogs(prev=>[...prev,msg.data])
        console.log("Stats updated:", msg.data);
        break;

      case 'log_spatial_update':
        setLogs(prev => [...prev, msg.data]);
        break;

      default:
        break;
    }
  };
  const fetchLogs = async () => {
  console.log("I am in fetchLogs before fetching")

  const { data, error } = await supabase
      .from('log_spatial_data')
      .select('*')
      .order('created_at', { ascending: true });
  console.log("I am in fetchLogs after fetching")
  if (!error) setLogs(data);
  console.log("This data is from fetchLogs",data)
};
fetchLogs();

  ws.onclose = () => console.log("WebSocket connection closed");
  ws.onerror = (err) => console.error("WebSocket error:", err);

  return () => ws.close(); // clean up on unmount

}, []);

  return (
    <div className="w-full h-full">
             {selectedLog && (
        <div className="absolute top-5 left-5 bg-black text-white p-3 rounded opacity-80 z-10">
          <p><strong>Spatial Data :</strong> {`x=${selectedLog.position_x},y=${selectedLog.position_y},z=${selectedLog.position_z}` || "N/A"}</p>
          <p><strong>Type:</strong> {selectedLog.log_level}</p>
          {/* <p><strong>Severity:</strong> {selectedLog.severity}</p> */}
          <p><strong>IP:</strong> {selectedLog.ip_address}</p>
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
                    {getGeometry(log.log_level, 3)}
                    <meshStandardMaterial color={getColor(log.log_level)} />
                </mesh>
        ))}
      </Canvas>
    </div>
  );
}

