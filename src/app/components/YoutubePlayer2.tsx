// app/components/YouTubePlayerScroll.tsx
"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Segment {
  startTime: number;
  endTime: number;
}

interface YouTubePlayerScrollProps {
  url: string;
  segments: Segment[];
}

const YouTubePlayerScroll: React.FC<YouTubePlayerScrollProps> = ({
  url,
  segments,
}) => {
  // Dummy list of videos. Replace URLs and times as needed.
  const segmentVideos: Segment[] = segments;

  // Which video configuration is currently active.
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { startTime, endTime } = segmentVideos[currentVideoIndex];

  // YouTube player state and references.
  const [currentTime, setCurrentTime] = useState(startTime);
  const [scale, setScale] = useState(1);
  const [isStretched, setIsStretched] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Lock flag to prevent multiple rapid index changes.
  const scrollLock = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(true);

  // Add this function
  const togglePlayPause = () => {
    if (playerRef.current) {
      const playerState = playerRef.current.getPlayerState();
      if (playerState === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  // Helper: extract the YouTube video id from the URL.
  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/.*(?:\?|&)v=|youtu\.be\/)([\w-]+)/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  const videoId = extractVideoId(url);

  // Update scale so the video covers the container (16:9 aspect ratio).
  const updateScale = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      const containerAR = width / height;
      const videoAR = 16 / 9;
      const newScale =
        containerAR > videoAR ? containerAR / videoAR : videoAR / containerAR;
      setScale(newScale);
    }
  };

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Initialize (or reinitialize) the YouTube player when the video config changes.
  useEffect(() => {
    if (!videoId) return;
    // Clean up any previous interval and player instance.
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const loadYTScript = () => {
      return new Promise<void>((resolve) => {
        const existingScript = document.getElementById("youtube-iframe-api");
        if (existingScript) {
          resolve();
          return;
        }
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
      });
    };

    const initializePlayer = () => {
      playerRef.current = new window.YT.Player("player", {
        width: "100%",
        height: "100%",
        videoId: videoId,
        playerVars: {
          start: startTime,
          end: endTime,
          controls: 0,
          rel: 0,
          autoplay: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setPlaybackQuality("highres");
            // Removed muting so that video plays with sound.
            event.target.playVideo();
            intervalRef.current = setInterval(() => {
              const time = playerRef.current.getCurrentTime();
              if (time >= endTime) {
                playerRef.current.seekTo(startTime);
              } else {
                setCurrentTime(time);
              }
            }, 500);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              playerRef.current.seekTo(startTime);
              playerRef.current.playVideo();
            }
          },
        },
      });
    };

    loadYTScript().then(() => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startTime, endTime]);

  // Update the iframe styling for stretch mode or normal mode.
  useEffect(() => {
    if (playerRef.current && playerRef.current.getIframe) {
      const iframe = playerRef.current.getIframe();
      if (isStretched) {
        iframe.style.position = "absolute";
        iframe.style.top = "50%";
        iframe.style.left = "50%";
        iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
        iframe.style.width = "auto";
        iframe.style.height = "auto";
        iframe.style.minWidth = "100%";
        iframe.style.minHeight = "100%";
      } else {
        iframe.style.position = "";
        iframe.style.top = "";
        iframe.style.left = "";
        iframe.style.transform = "";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.minWidth = "";
        iframe.style.minHeight = "";
      }
    }
  }, [isStretched, scale]);

  // Handle manual seek changes (if needed).
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Math.min(
      endTime,
      Math.max(startTime, parseFloat(e.target.value))
    );
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  // Use onWheel directly on the scroll overlay.
  const onWheelHandler = (e: React.WheelEvent) => {
    // Prevent the default scroll behavior.
    e.preventDefault();
    // Lock to prevent rapid multiple changes.
    if (scrollLock.current) return;
    scrollLock.current = true;
    setTimeout(() => {
      scrollLock.current = false;
    }, 800);

    if (e.deltaY > 0) {
      // Next video.
      if (currentVideoIndex < segmentVideos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      }
    } else if (e.deltaY < 0) {
      // Previous video.
      if (currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Phone container */}
      <div
        ref={containerRef}
        className="bg-black relative w-72 h-[600px] rounded-[45px] shadow-md border-8 border-zinc-900 "
      >
        {/* Decoration borders */}
        <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none"></div>
        {/* Toggle stretch mode */}
        <button
          onClick={() => {
            setIsStretched((prev) => !prev);
          }}
          className="absolute z-20 top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded"
        >
          {isStretched ? "Normal" : "Stretch"}
        </button>
        <button
          onClick={togglePlayPause}
          className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-700 text-white px-4 py-2 rounded"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        {/* YouTube player container */}
        <div className="relative w-full h-full bg-zinc-900/10 overflow-hidden rounded-[37px]">
          <div id="player" style={{ width: "100%", height: "100%" }} />
          <input
            type="range"
            min={startTime}
            max={endTime}
            step="0.5"
            value={currentTime}
            onChange={handleSeek}
            className="absolute bottom-2 left-0 w-full z-20 appearance-none bg-transparent"
          />
        </div>
        {/* Wheel event overlay */}
        <div
          ref={scrollRef}
          onWheel={onWheelHandler}
          // The overlay is absolute and transparent, and we disable its scrolling.
          className="absolute inset-0 z-10 overflow-hidden"
        >
          {/* This inner div can remain empty. */}
        </div>
        {/* Extra decoration elements */}
        <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md" />
        <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
        <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
        <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md" />
      </div>
    </div>
  );
};

export default YouTubePlayerScroll;
