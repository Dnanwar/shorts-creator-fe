"use client";
import { useEffect, useState } from "react";
import YouTubePlayerScroll from "./components/YouTubePlayerScroll";
import PullToRevealInput from "./components/PullToRevealInput";
import { usePlayerStateStore } from "./stores/PlayerStateStore";
export default function Home() {
  const { isFetchingPlayerState, playerState } = usePlayerStateStore();
  const [backgroundPositions, setBackgroundPositions] = useState<string[]>([]);
  useEffect(() => {
    const layers = 6;
    let animationFrameId: number | undefined;

    if (isFetchingPlayerState) {
      let x = Array.from({ length: layers }, () => 0);

      const moveBackground = () => {
        const newPositions = x.map((xi, index) => {
          if (index % 2 === 0) {
            xi += 0.5;
            if (xi > 150) xi = 0;
          } else {
            xi -= 0.5;
            if (xi < -150) xi = 0;
          }
          x[index] = xi;
          return `${xi}px 0`;
        });

        setBackgroundPositions(newPositions);
        animationFrameId = requestAnimationFrame(moveBackground);
      };

      animationFrameId = requestAnimationFrame(moveBackground);
    } else {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setBackgroundPositions(Array.from({ length: layers }, () => "0px 0px"));
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setBackgroundPositions(Array.from({ length: layers }, () => "0px 0px"));
    };
  }, [isFetchingPlayerState]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-black relative overflow-hidden">
      {/* 🔥 Background Waves - multiple layers */}
      <div className="absolute inset-0 z-0 overflow-hidden flex flex-col">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex-1"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M0 50 Q25 0 50 50 T100 50' fill='transparent' stroke='%23ffffff10' stroke-width='1.5'/></svg>")`,
              backgroundSize: "150px 150px",
              backgroundRepeat: "repeat",
              backgroundPosition: backgroundPositions[index] || "0px 0px",
              opacity: 0.35 + index * 0.1, // deeper layers lighter
            }}
          />
        ))}
      </div>
      {/* 🔥 Top Heading */}
      <div className="relative z-10 w-full" style={{ padding: "24px 0" }}>
        <p
          style={{
            color: "white",
            fontSize: "2.25rem",
            fontWeight: 100,
            fontFamily: "'Poppins', sans-serif",
            textAlign: "center",
            textShadow: "0 0 20px white",
            margin: 0,
          }}
        >
          Shorts Creator
        </p>
      </div>
      {/* 🔥 Pull Input + YouTube Player */}
      <div className="relative z-10 w-full flex flex-col items-center px-4 gap-4">
        <PullToRevealInput />
        <YouTubePlayerScroll
          url={playerState?.url}
          segments={playerState?.segments}
        />
      </div>
    </div>
  );
}
