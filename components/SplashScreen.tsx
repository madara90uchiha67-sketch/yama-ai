"use client";
import React from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <video
        src="Logo.mp4"
        autoPlay
        muted
        playsInline
        onEnded={onFinish}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
