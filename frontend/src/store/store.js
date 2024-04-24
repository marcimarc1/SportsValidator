import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// We use immer to change nested state in zustand
// like state.videoElement.currentTime
export const useVideoStore = create(
  immer((set) => ({
    videoElement: null,
    setVideoElement: (videoElement) => set(() => ({ videoElement })),
    updateCurrentTime: (newTime) => {
      set((state) => {
        state.videoElement.currentTime = newTime;
      });
    },
  })),
);