"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { usePlayerStateStore } from "../stores/PlayerStateStore"; // ✅ import player store
import { convertToRanges } from "../utils/convertToRanges";

export default function PullToRevealInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputClicked, setInputClicked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false); // 🆕 New state for focus

  const [url, setUrl] = useState("");
  const { isFetchingPlayerState, setPlayerState, setIsFetchingPlayerState } =
    usePlayerStateStore();

  useEffect(() => {
    if (!inputClicked || !url) return;

    const fetchTimestamps = async () => {
      try {
        setIsFetchingPlayerState(true);
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
        console.log("Segments are:", segments);

        setPlayerState({ url: url, segments });
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
        setPlayerState({ url: "", segments: [] });
      } finally {
        setIsFetchingPlayerState(false);
      }
    };

    fetchTimestamps();
  }, [inputClicked, url]);

  return (
    <div
      className="flex flex-col items-center justify-center transition-all duration-500 p-4 relative"
      onBlur={() => setIsFocused(false)}
    >
      <div className="w-full max-w-md relative">
        <div className="flex items-center w-full">
          {/* 🔥 Conditionally render input or loading animation */}
          {isFetchingPlayerState ? (
            // 🌀 Beautiful Loading spinner
            <div className="flex-1 py-3 flex justify-center items-center space-x-2">
              <span className="h-2 w-2 bg-white rounded-full animate-ping"></span>
              <span className="h-2 w-2 bg-white rounded-full animate-ping [animation-delay:0.2s]"></span>
              <span className="h-2 w-2 bg-white rounded-full animate-ping [animation-delay:0.4s]"></span>
            </div>
          ) : (
            // ✨ Normal Input when not fetching
            <>
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter URL"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                disabled={isFetchingPlayerState}
                className={`
                  text-center text-xs w-full rounded-full pl-3 outline-none transition-all duration-300
                  backdrop-blur-md
                  ${isFocused ? "text-lg py-3 backdrop-blur-lg ring-1" : ""}
                  ${
                    isFetchingPlayerState ? "opacity-50 cursor-not-allowed" : ""
                  }
                `}
              />

              {/* 🔥 Only show Chevron if not fetching and input not empty */}
              {inputValue.trim() && !isFetchingPlayerState && (
                <ChevronRight
                  onClick={() => {
                    setUrl(inputValue);
                    setInputClicked(true);
                  }}
                  className="ml-1 p-0.95 flex items-center justify-center text-white rounded-full transition-all duration-200 cursor-pointer"
                />
              )}
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mt-3 text-center bg-red-50 border border-red-300 rounded-md p-2">
            Unable to retrieve data. The video may not have a heat map
            available, or a cache error occurred. Please try again later.
          </p>
        )}
      </div>
    </div>
  );
}
