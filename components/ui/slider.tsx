"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { motion, useMotionValue, useSpring } from "framer-motion";

function cn(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

function clamp(n: number, a: number, b: number) {
    return Math.min(b, Math.max(a, n));
}

// value (min..max) -> px position of THUMB CENTER inside track (considering thumb size)
function valueToCenterPx(value: number, min: number, max: number, trackW: number, thumbW: number) {
    const v = clamp(value, min, max);
    if (max === min) return thumbW / 2;
    const usable = Math.max(0, trackW - thumbW); // center travels across usable + thumbW/2 offset
    const t = (v - min) / (max - min); // 0..1
    return thumbW / 2 + t * usable;
}

// snap to nearest step
function snapToStep(value: number, min: number, step: number) {
    const n = Math.round((value - min) / step);
    return min + n * step;
}

type Props = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    snapAnimated?: boolean;
};

export const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    Props
>(({ className, snapAnimated = true, min = 0, max = 100, step = 1, value, defaultValue, onValueChange, onValueCommit, ...props }, ref) => {
    const minN = Number(min);
    const maxN = Number(max);
    const stepN = Number(step);

    // current numeric value
    const current = (value?.[0] ?? defaultValue?.[0] ?? minN) as number;

    const [dragging, setDragging] = React.useState(false);

    // measure track width
    const trackRef = React.useRef<HTMLSpanElement | null>(null);
    const [trackW, setTrackW] = React.useState(0);

    React.useEffect(() => {
        if (!trackRef.current) return;

        const el = trackRef.current;
        const ro = new ResizeObserver(() => {
            setTrackW(el.getBoundingClientRect().width);
        });
        ro.observe(el);
        setTrackW(el.getBoundingClientRect().width);

        return () => ro.disconnect();
    }, []);

    // keep thumb width consistent with your UI (h-4 w-4)
    const THUMB_W = 16;

    // motion value = center px
    const xCenter = useMotionValue(valueToCenterPx(current, minN, maxN, trackW, THUMB_W));
    const xSpring = useSpring(xCenter, {
        stiffness: 620,
        damping: 38,
        mass: 0.85,
    });

    // sync when external value changes (not during drag)
    React.useEffect(() => {
        if (!dragging) {
            xCenter.set(valueToCenterPx(current, minN, maxN, trackW, THUMB_W));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, dragging, trackW, minN, maxN]);

    const setCenterFromValue = (v: number) => {
        xCenter.set(valueToCenterPx(v, minN, maxN, trackW, THUMB_W));
    };

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                "relative flex w-full touch-none select-none items-center py-2",
                "group", // 用 group 恢复 hover 视觉（即使 overlay pointer-events none）
                className
            )}
            min={minN}
            max={maxN}
            step={stepN}
            value={value}
            defaultValue={defaultValue}
            onPointerDown={(e) => {
                setDragging(true);
                props.onPointerDown?.(e);
            }}
            onPointerUp={(e) => {
                setDragging(false);
                props.onPointerUp?.(e);
            }}
            onPointerCancel={(e) => {
                setDragging(false);
                props.onPointerCancel?.(e);
            }}
            onLostPointerCapture={(e) => {
                setDragging(false);
                props.onLostPointerCapture?.(e);
            }}
            onValueChange={(vals) => {
                const v = (vals?.[0] ?? minN) as number;
                // 拖动跟手：直接跟随
                setCenterFromValue(v);
                onValueChange?.(vals);
            }}
            onValueCommit={(vals) => {
                const v = (vals?.[0] ?? minN) as number;
                const snapped = snapToStep(v, minN, stepN);

                // 松手吸附动画：弹簧到 snapped
                if (snapAnimated) setCenterFromValue(snapped);

                onValueCommit?.([snapped]);
            }}
            {...props}
        >
            <SliderPrimitive.Track
                ref={trackRef}
                className={cn(
                    "relative h-1.5 w-full grow overflow-hidden rounded-full",
                    "bg-neutral-200/80 dark:bg-neutral-800/70",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                )}
            >
                {/* 保留真实 Range（可访问性/结构稳定），但视觉交给 motion */}
                <SliderPrimitive.Range className="absolute h-full bg-neutral-900/0 dark:bg-white/0" />

                {/* 视觉 Range：宽度 = centerX（从左到 thumb center） */}
                <motion.div
                    className={cn(
                        "absolute left-0 top-0 h-full rounded-full",
                        "bg-neutral-900 dark:bg-white",
                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.12)]"
                    )}
                    style={{
                        width: snapAnimated ? xSpring : xCenter,
                    }}
                />
            </SliderPrimitive.Track>

            {/* 真实 Thumb：保持交互/ARIA（透明但可拖拽） */}
            <SliderPrimitive.Thumb
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                    // 比视觉 Thumb 大一点点，拖动更容易
                    "h-6 w-6 rounded-full opacity-0"
                )}
            />

            {/* 视觉 Thumb：位置与 Range 统一，且恢复 hover/active 的放大手感 */}
            <motion.div
                className={cn(
                    "pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                    "h-4 w-4 rounded-full",
                    "bg-white dark:bg-neutral-950",
                    "border border-neutral-300/90 dark:border-neutral-700/80",
                    "shadow-[0_6px_18px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.10)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.35)]",
                    "transition-[transform,box-shadow] duration-150 ease-out",
                    // ✅ hover 还原：悬停在 slider 区域就有轻微放大（更稳定，不依赖 pointer-events）
                    "group-hover:scale-110",
                    // ✅ active 还原：拖动中更大更亮
                    dragging ? "scale-125 shadow-[0_14px_30px_rgba(0,0,0,0.18),0_3px_8px_rgba(0,0,0,0.14)]" : ""
                )}
                style={{
                    left: snapAnimated ? xSpring : xCenter,
                }}
            />
        </SliderPrimitive.Root>
    );
});
Slider.displayName = "Slider";
