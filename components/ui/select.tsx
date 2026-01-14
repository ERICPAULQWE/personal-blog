"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

function cn(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            // Apple-like：圆角、半透明、细边框、轻阴影
            "flex h-10 w-full items-center justify-between rounded-2xl px-3 py-2 text-sm",
            "border border-neutral-200/70 bg-white/70 backdrop-blur-md",
            "shadow-sm shadow-black/5",
            "text-neutral-900",
            "hover:bg-white/80",
            "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
            // Press feedback（更像系统控件）
            "active:scale-[0.99]",
            // Focus
            "focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:ring-offset-2 focus:ring-offset-white",
            // Dark
            "dark:border-neutral-800/70 dark:bg-neutral-950/60 dark:text-neutral-100 dark:hover:bg-neutral-950/70",
            "dark:shadow-black/30 dark:focus:ring-white/10 dark:focus:ring-offset-neutral-950",
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-70" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            position={position}
            className={cn(
                // 容器
                "z-[90] overflow-hidden rounded-2xl border",
                "border-neutral-200/70 bg-white/90 backdrop-blur-xl",
                "shadow-2xl shadow-black/10",
                "dark:border-neutral-800/70 dark:bg-neutral-950/80 dark:shadow-black/40",

                // ✅ 打开/关闭动画（依赖 tailwindcss-animate）
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-2",

                className
            )}
            {...props}
        >
            <SelectPrimitive.Viewport className="p-1">
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-xl px-3 pr-8 py-2 text-sm outline-none",
            "text-neutral-900 dark:text-neutral-100",
            // hover / focus（高级但克制）
            "focus:bg-neutral-100 data-[highlighted]:bg-neutral-100",
            "dark:focus:bg-neutral-800/60 dark:data-[highlighted]:bg-neutral-800/60",
            // 过渡更丝滑
            "transition-colors",
            className
        )}
        {...props}
    >
        <span className="absolute right-2 inline-flex h-5 w-5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4 opacity-80" />
            </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";
