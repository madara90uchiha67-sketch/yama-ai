"use client";

import React, { useState, useRef } from "react";

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStart = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {!isPlaying ? (
        <button
          onClick={handleStart}
          style={{
            padding: "16px 32px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: "#2563eb",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Iniciar animación con sonido
        </button>
      ) : (
        <video
          ref={videoRef}
          src="/1000054026.mp4"
          playsInline
          onEnded={onFinish}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
}
