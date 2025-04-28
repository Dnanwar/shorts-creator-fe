"use client";
import { Maximize2, Minimize2, Pause, Play } from "lucide-react";
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
  if (url && segments.length !== 0) {
    const segmentVideos: Segment[] = segments;
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const { startTime, endTime } = segmentVideos[currentVideoIndex];
    const [currentTime, setCurrentTime] = useState(startTime);
    const [scale, setScale] = useState(1);
    const [isStretched, setIsStretched] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [inPhoneCnt, setInPhoneCnt] = useState(false);
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollLock = useRef<boolean>(false);
    // ✨ Touch swipe handling
    const [touchStartY, setTouchStartY] = useState<number | null>(null);
    const [touchEndY, setTouchEndY] = useState<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      setTouchStartY(e.touches[0].clientY);
    };
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      setTouchEndY(e.touches[0].clientY);
    };
    const handleTouchEnd = () => {
      if (touchStartY === null || touchEndY === null) return;
      const distance = touchStartY - touchEndY;
      const minSwipeDistance = 50;
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          // Swipe up: next video
          if (currentVideoIndex < segmentVideos.length - 1) {
            setCurrentVideoIndex(currentVideoIndex + 1);
            setIsStretched(false);
            setIsPlaying(true);
          }
        } else {
          // Swipe down: previous video
          if (currentVideoIndex > 0) {
            setCurrentVideoIndex(currentVideoIndex - 1);
            setIsStretched(false);
            setIsPlaying(true);
          }
        }
      }
      setTouchStartY(null);
      setTouchEndY(null);
    };
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
    const extractVideoId = (url: string) => {
      const regex = /(?:youtube\.com\/.*(?:\?|&)v=|youtu\.be\/)([\w-]+)/;
      const matches = url.match(regex);
      return matches ? matches[1] : null;
    };
    const videoId = extractVideoId(url);
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
    useEffect(() => {
      if (!videoId) return;
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
              event.target.playVideo();
              intervalRef.current = setInterval(() => {
                const time = playerRef.current.getCurrentTime();
                if (time >= endTime) {
                  playerRef.current.seekTo(startTime);
                } else {
                  setCurrentTime(time);
                }
              }, 200); // Faster smoother tracking
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
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Math.min(
        endTime,
        Math.max(startTime, parseFloat(e.target.value))
      );
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    };
    const onWheelHandler = (e: React.WheelEvent) => {
      e.preventDefault();
      if (scrollLock.current) return;
      scrollLock.current = true;
      setTimeout(() => {
        scrollLock.current = false;
      }, 800);
      if (e.deltaY > 0) {
        if (currentVideoIndex < segmentVideos.length - 1) {
          setCurrentVideoIndex(currentVideoIndex + 1);
          setIsStretched(false);
          setIsPlaying(true);
        }
      } else if (e.deltaY < 0) {
        if (currentVideoIndex > 0) {
          setCurrentVideoIndex(currentVideoIndex - 1);
          setIsStretched(false);
          setIsPlaying(true);
        }
      }
    };
    return (
      <div className="relative flex items-center justify-center">
        <div
          ref={containerRef}
          className="bg-black relative w-72 h-[600px] rounded-[45px] shadow-md border-8 border-zinc-900"
          onMouseEnter={() => setInPhoneCnt(true)}
          onMouseLeave={() => setInPhoneCnt(false)}
        >
          <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none" />
          {/* Stretch Mode Button */}
          {inPhoneCnt && (
            <button
              onClick={() => setIsStretched((prev) => !prev)}
              className="absolute z-20 top-2 right-2 bg-white/0 hover:bg-white/10 text-white p-3 rounded-full transition-all cursor-pointer w-10 h-10 flex items-center justify-center backdrop-blur-md"
            >
              {isStretched ? <Minimize2 /> : <Maximize2 />}
            </button>
          )}
          {/* Play/Pause Button */}
          {inPhoneCnt && (
            <button
              onClick={togglePlayPause}
              className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/0 text-white p-3 rounded-full hover:backdrop-blur-md transition-all cursor-pointer w-14 h-14 flex items-center justify-center"
            >
              {isPlaying ? <Pause /> : <Play />}
            </button>
          )}
          {/* Player */}
          <div className="relative w-full h-full bg-zinc-900/10 overflow-hidden rounded-[37px]">
            <div id="player" style={{ width: "100%", height: "100%" }} />
            {/* Progress Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="w-full backdrop-blur-md rounded-full h-1 relative">
                <div
                  className="bg-red-600 dark:bg-red-500 h-1 rounded-full transition-[width] ease-in-out duration-500"
                  style={{
                    width: `${(
                      ((currentTime - startTime) / (endTime - startTime)) *
                      100
                    ).toFixed(6)}%`,
                  }}
                />
                <input
                  type="range"
                  min={startTime}
                  max={endTime}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute top-0 left-0 w-full h-2.5 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
          {/* Swipe Overlay */}
          <div
            ref={scrollRef}
            onWheel={onWheelHandler}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 z-10 overflow-hidden"
          />
          {/* Extra decoration elements */}
          <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md" />
          <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
          <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
          <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="relative flex items-center justify-center">
        {/* Phone container */}
        <div className="bg-black relative w-72 h-[600px] rounded-[45px] shadow-md border-8 border-zinc-900 ">
          {/* Decoration borders */}
          <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none"></div>

          {/* Extra decoration elements */}
          <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md" />
          <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
          <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md" />
          <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md" />
        </div>
      </div>
    );
  }
};
export default YouTubePlayerScroll;
