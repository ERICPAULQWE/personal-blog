export type LabMeta = {
    slug: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    tags?: string[];
};

export const labs: LabMeta[] = [
    {
        slug: "counter",
        title: "Counter",
        description: "一个最小交互示例：计数器 + 动画",
        date: "2026-01-12",
        tags: ["React", "Demo"],
    },
];
