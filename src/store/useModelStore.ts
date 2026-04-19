"use client";

// ==================== 模型状态 ==================== //

// ========== React、Next、Utils ========== //
import { create } from "zustand";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { Model } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

interface ModelStore {
    modelList: Model[];
    setModelList: (modelList: Model[]) => void;
}

const initialState = {
    modelList: [],
};

export const useModelStore = create<ModelStore>((set) => ({
    ...initialState,
    setModelList: (modelList: Model[]) => set({ modelList: modelList }),
}));
