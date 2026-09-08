"use client";

import React, { useEffect, useRef } from "react";

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Forzar velocidad normal de reproducción (1.0)
      videoRef.current.playbackRate = 1.0;

      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  }, []);

  const handleUserInteraction = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
    }
  };

  return (
    <div
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <video
        ref={videoRef}
        src="/lv_0_20260907220958.mp4"
        playsInline
        preload="auto"
        onEnded={onFinish}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          // Forzar renderizado fluido por tarjeta gráfica (GPU)
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
