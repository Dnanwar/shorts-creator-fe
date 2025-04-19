"use client";
import { create } from "zustand";

type UrlStore = {
  url: string;
  setUrl: (newUrl: string) => void;
};

export const useUrlStore = create<UrlStore>((set) => ({
  url: "",
  setUrl: (newUrl) => set({ url: newUrl }),
}));
