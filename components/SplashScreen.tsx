"use client";

import React, { useEffect, useRef } from "react";

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Intentamos reproducir el video con audio automáticamente
      videoRef.current.play().catch(() => {
        // Si el navegador bloquea el audio automático, silenciamos temporalmente y reproducimos
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  }, []);

  // Si el usuario toca la pantalla, intentamos desmutear el video al instante
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
        cursor: "pointer",
      }}
    >
      <video
        ref={videoRef}
        src="/lv_0_20260907220958.mp4"
        playsInline
        onEnded={onFinish}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
