"use client";
import React from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  return (
      <video
        src="/lv_0_20260907220958.mp4"        autoPlay
        muted
        playsInline
        onEnded={onFinish}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
