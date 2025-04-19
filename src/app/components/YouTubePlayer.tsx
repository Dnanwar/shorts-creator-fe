"use client";
import { useEffect, useRef, useState } from "react";
interface YouTubePlayerProps {
  url: string;
  startTime: number;
  endTime: number;
}
const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  url,
  startTime,
  endTime,
}) => {
  const [currentTime, setCurrentTime] = useState(30);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/.*(?:\?|&)v=|youtu\.be\/)([\w-]+)/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };
  const videoId = extractVideoId(url);
  //   const startTime = 30;
  //   const endTime = 35;

  // Load YouTube API script
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, []);

  const initializePlayer = () => {
    playerRef.current = new window.YT.Player("player", {
      width: 272,
      height: 572,
      videoId: videoId,
      playerVars: {
        start: startTime,
        end: endTime,
        controls: 0,
        rel: 0,
        autoplay: 1,
        loop: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (event: any) => {
    event.target.playVideo();
    intervalRef.current = setInterval(updateTime, 100);
  };

  const updateTime = () => {
    const time = playerRef.current.getCurrentTime();
    if (time > endTime) {
      playerRef.current.seekTo(startTime);
      setCurrentTime(startTime);
    } else {
      setCurrentTime(time);
    }
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      playerRef.current.seekTo(startTime);
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Math.min(
      endTime,
      Math.max(startTime, parseFloat(e.target.value))
    );
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  return (
    <div className="relative mx-auto border-gray-300 dark:border-gray-800 bg-gray-300 dark:bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
      {/* Side buttons */}
      <div className="h-[32px] w-[3px] bg-gray-300 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg" />
      <div className="h-[46px] w-[3px] bg-gray-300 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg" />
      <div className="h-[46px] w-[3px] bg-gray-300 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg" />
      <div className="h-[64px] w-[3px] bg-gray-300 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg" />

      {/* Screen area */}
      <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800 relative">
        <div id="player" />
        <input
          type="range"
          min={startTime}
          max={endTime}
          step="0.5"
          value={currentTime}
          onChange={handleSeek}
          className="absolute bottom-2 left-0 w-full z-10 appearance-none bg-transparent"
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;
