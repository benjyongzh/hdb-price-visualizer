import { StateCreator } from "zustand";

export type SettingState = {
  settings: {
    theme: "light" | "dark";
    //   notificationsEnabled: boolean;
    setTheme: (theme: "light" | "dark") => void;
    //   toggleNotifications: () => void;
  };
};
// User slice creator function
export const createSettingSlice: StateCreator<SettingState> = (set) => ({
  settings: {
    theme: "light",
    //   displayNotificationsEnabled: true,
    setTheme: (theme) =>
      set((state) => ({
        settings: { ...state.settings, theme },
      })),
    //   toggleNotifications: () =>
    //     set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
  },
});
