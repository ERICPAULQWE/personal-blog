"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
    DEFAULT_READING_SETTINGS,
    FONT_FAMILY_MAP,
    FONT_SIZE_MAP,
    LINE_HEIGHT_MAP,
    type ReadingSettings,
    STORAGE_KEY,
} from "@/lib/reading-settings";

function safeParse(v: string | null): ReadingSettings | null {
    if (!v) return null;
    try {
        return JSON.parse(v) as ReadingSettings;
    } catch {
        return null;
    }
}

function applyToRoot(s: ReadingSettings) {
    const root = document.documentElement;
    root.style.setProperty("--reading-font-size", FONT_SIZE_MAP[s.fontSize]);
    root.style.setProperty("--reading-line-height", LINE_HEIGHT_MAP[s.lineHeight]);
    root.style.setProperty("--reading-font-family", FONT_FAMILY_MAP[s.font]);
}

export function useReadingSettings(): {
    settings: ReadingSettings;
    setSettings: Dispatch<SetStateAction<ReadingSettings>>;
    reset: () => void;
} {
    // ✅ 关键：用 initializer 读取 localStorage，避免在 effect 里 setState
    const initial = useMemo(() => {
        if (typeof window === "undefined") return DEFAULT_READING_SETTINGS;
        const saved = safeParse(localStorage.getItem(STORAGE_KEY));
        return saved ?? DEFAULT_READING_SETTINGS;
    }, []);

    const [settings, setSettings] = useState<ReadingSettings>(initial);

    // ✅ 首次挂载把变量写到 root（外部系统同步 OK）
    useEffect(() => {
        applyToRoot(settings);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ settings 变化：写入 localStorage + 更新 CSS 变量
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        applyToRoot(settings);
    }, [settings]);

    return {
        settings,
        setSettings,
        reset: () => setSettings(DEFAULT_READING_SETTINGS),
    };
}
