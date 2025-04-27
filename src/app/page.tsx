"use client";
import YouTubePlayerScroll from "./components/YouTubePlayerScroll";
import PullToRevealInput from "./components/PullToRevealInput";
import { usePlayerStateStore } from "./stores/PlayerStateStore";

export default function Home() {
  const { isFetchingPlayerState, playerState } = usePlayerStateStore();

  return (
    <div
      className="flex flex-col min-h-screen w-full
      bg-black
      [background-image:radial-gradient(circle_at_top_center,hsl(354.67,92%,55%)_0,transparent_65%),radial-gradient(circle_at_bottom_center,hsla(0,0%,100%,0)_0%,transparent_40%)]"
    >
      {/* 🔥 Top Heading */}
      <div className="w-full py-6">
        <p className="text-white text-4xl font-extralight text-center drop-shadow-md [text-shadow:0_0_10px_white]">
          Shorts Creator
        </p>
      </div>

      {/* 🔥 Pull Input + YouTube Scroll */}
      <div className="w-full flex flex-col items-center px-4 gap-4">
        <PullToRevealInput />

        <YouTubePlayerScroll
          url={playerState?.url}
          segments={playerState?.segments}
        />
      </div>

      {/* (Optional) You could add a footer below if you want */}
    </div>
  );
}
