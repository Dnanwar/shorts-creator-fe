"use client";
import { create } from "zustand";

interface Segment {
  startTime: number;
  endTime: number;
}

interface PlayerState {
  url: string;
  segments: Segment[];
}

type PlayerStateStore = {
  playerState: PlayerState;
  isFetchingPlayerState: boolean;
  setPlayerState: (newState: PlayerState) => void;
  setIsFetchingPlayerState: (fetching: boolean) => void;
};

export const usePlayerStateStore = create<PlayerStateStore>((set) => ({
  playerState: {
    url: "",
    segments: [],
  },
  isFetchingPlayerState: false, // ✅ initial state
  setPlayerState: (newState) => set({ playerState: newState }),
  setIsFetchingPlayerState: (fetching) =>
    set({ isFetchingPlayerState: fetching }),
}));
