"use client";
import { useState } from "react";
import YamaApp from "@/components/YamaApp";
import SplashScreen from "@/components/SplashScreen";

export default function Page() {
  const [showSplash, setShowSplash] = useState(true);
  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  return <YamaApp />;
}
