export type FontSizeStep = 1 | 2 | 3 | 4 | 5;
export type LineHeightStep = 1 | 2 | 3 | 4 | 5;

export type ReadingFont = "system" | "serif" | "mono" | "song" | "kai" | "hei";

export type ReadingSettings = {
    fontSize: FontSizeStep;      // 1-5，3=默认舒适
    lineHeight: LineHeightStep;  // 1-5，3=默认舒适
    font: ReadingFont;
    mdAutoColor: boolean; // Markdown 自动上色开关
};

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
    fontSize: 3,
    lineHeight: 3,
    font: "system",
    mdAutoColor: true, // 默认开启
};

export const FONT_SIZE_MAP: Record<FontSizeStep, string> = {
    1: "0.9375rem",  // 15
    2: "1rem",       // 16
    3: "1.0625rem",  // 17 ✅舒适
    4: "1.125rem",   // 18
    5: "1.25rem",    // 20
};

export const LINE_HEIGHT_MAP: Record<LineHeightStep, string> = {
    1: "1.55",
    2: "1.7",
    3: "1.85", // ✅舒适
    4: "2.0",
    5: "2.2",
};

export const FONT_FAMILY_MAP: Record<ReadingFont, string> = {
    system:
        'ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    serif:
        'ui-serif, "New York", "Songti SC", "STSong", "Noto Serif CJK SC", serif',
    mono:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    song:
        '"Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", ui-serif, serif',
    kai:
        '"Kaiti SC", "STKaiti", "KaiTi", "DFKai-SB", "Noto Serif CJK SC", ui-serif, serif',
    hei:
        '"Heiti SC", "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", ui-sans-serif, sans-serif',
};

export const STORAGE_KEY = "reading_settings_v1";
