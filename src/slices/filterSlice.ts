import { StateCreator } from "zustand";

export type FilterState = {
  filters: {
    flatTypes: Array<string>;
    addFlatType: (flat: string) => void;
    removeFlatType: (flat: string) => void;
  };
};

// User slice creator function
export const createFilterSlice: StateCreator<FilterState> = (set) => ({
  filters: {
    flatTypes: [],
    addFlatType: (flatType) => {
      // Check if the new flattype is valid
      set((state) => {
        if (!state.filters.flatTypes.includes(flatType)) {
          return {
            filters: {
              ...state.filters,
              flatTypes: [...state.filters.flatTypes, flatType],
            },
          };
        }
        return state; // Return the unchanged state if no update is made
      });
    },

    removeFlatType: (flatType) => {
      // Check if the new flattype is valid
      set((state) => {
        if (state.filters.flatTypes.includes(flatType)) {
          return {
            filters: {
              ...state.filters,
              flatTypes: state.filters.flatTypes.filter(
                (flat) => flat !== flatType
              ),
            },
          };
        }
        return state; // Return the unchanged state if no update is made
      });
    },
  },
});
