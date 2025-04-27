"use client";
import Image from "next/image";
import YouTubePlayerScroll from "./components/YouTubePlayerScroll";
import { useUrlStore } from "./stores/UrlStore";
import PullToRevealInput from "./components/PullToRevealInput";
import { useEffect, useState } from "react";
import { convertToRanges } from "./utils/convertToRanges";

export default function Home() {
  const { url, setUrl } = useUrlStore(); // Access the URL state and setter function
  const [playerState, setPlayerState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const fetchTimestamps = async () => {
      try {
        const res = await fetch("/api/getTimeStamps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: url, threshold: 0.7 }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }

        const data = await res.json();
        const segments = convertToRanges(
          data.heat_map_info,
          data.total_duration
        );
        console.log("segments are:", segments);
        setPlayerState({ url: url, segments: segments });
        setError(null);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setPlayerState(null);
      }
    };
    fetchTimestamps();
  }, [url]);

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full
    bg-black 
    [background-image:radial-gradient(circle_at_top_center,hsl(354.67,92%,55%)_0,transparent_65%),radial-gradient(circle_at_bottom_center,hsla(0,0%,100%,0)_0%,transparent_40%)]"
    >
      <div style={{ display: "inline-block" }}>
        <div className="flex justify-center items-center  w-full">
          <p className="text-white text-4xl font-extralight text-center p-4 drop-shadow-md [text-shadow:0_0_10px_white]">
            Shorts Creator
          </p>
        </div>

        <PullToRevealInput />
        <YouTubePlayerScroll
          url={playerState?.url}
          segments={playerState?.segments}
        />
      </div>
    </div>
  );
}
