"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { SensorSample, VisionEvent } from "@/lib/aiot";

function formatTimestamp(value: number) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createSample(indexFromNow: number): SensorSample {
  const baseTime = Date.now() - indexFromNow * 45_000;
  const drift = 18 - indexFromNow;

  return {
    timestamp: formatTimestamp(baseTime),
    temperature: Number((25.2 + drift * 0.18 + Math.sin(drift / 2) * 1.8).toFixed(1)),
    humidity: Number((57 + Math.cos(drift / 3) * 8 + drift * 0.2).toFixed(1)),
    power: Number((42 + Math.sin(drift / 4) * 14 + drift * 0.4).toFixed(1)),
    occupancy: Math.round(48 + Math.sin(drift / 2.5) * 18 + drift),
  };
}

function createVisionEvent(camera: string, label: string, confidence: number): VisionEvent {
  return {
    id: `${camera}-${Date.now()}`,
    camera,
    label,
    confidence,
    timestamp: formatTimestamp(Date.now()),
  };
}

const seedEvents: VisionEvent[] = [
  createVisionEvent("Entry Camera", "face detected", 92),
  createVisionEvent("Vision Lab Node", "gesture detected", 81),
  createVisionEvent("Entry Camera", "helmet detected", 88),
];

export function useRealtimeFeed() {
  const [samples, setSamples] = useState<SensorSample[]>(() =>
    Array.from({ length: 18 }, (_, index) => createSample(17 - index)),
  );
  const [visionEvents, setVisionEvents] = useState<VisionEvent[]>(seedEvents);

  const tickFeed = useEffectEvent(() => {
    setSamples((current) => {
      const last = current[current.length - 1];
      const next: SensorSample = {
        timestamp: formatTimestamp(Date.now()),
        temperature: Number(clamp(last.temperature + (Math.random() - 0.45) * 1.4, 22, 34).toFixed(1)),
        humidity: Number(clamp(last.humidity + (Math.random() - 0.5) * 3.4, 38, 78).toFixed(1)),
        power: Number(clamp(last.power + (Math.random() - 0.52) * 4.8, 25, 78).toFixed(1)),
        occupancy: Math.round(clamp(last.occupancy + (Math.random() - 0.4) * 10, 8, 98)),
      };

      return [...current.slice(-17), next];
    });

    if (Math.random() > 0.4) {
      const events = [
        { camera: "Entry Camera", label: "face detected" },
        { camera: "Vision Lab Node", label: "object tracked" },
        { camera: "Entry Camera", label: "crowd density alert" },
      ];
      const event = events[Math.floor(Math.random() * events.length)];

      setVisionEvents((current) => [
        createVisionEvent(event.camera, event.label, Math.round(62 + Math.random() * 35)),
        ...current,
      ].slice(0, 5));
    }
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      tickFeed();
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, []);

  const latest = samples[samples.length - 1];

  return {
    samples,
    latest,
    visionEvents,
  };
}