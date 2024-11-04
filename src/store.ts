import { create } from "zustand";
import { FilterState, createFilterSlice } from "./slices/filterSlice";
import { SettingState, createSettingSlice } from "./slices/settingSlice";

type StoreState = {
  filters: FilterState["filters"];
  settings: SettingState["settings"];
};

// Create the store
const useStore = create<StoreState>()((...a) => ({
  ...createFilterSlice(...a),
  ...createSettingSlice(...a),
}));

export default useStore;
