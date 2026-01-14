import Link from "next/link";
import { getAllTags } from "@/lib/content";
import { Hash, Sparkles, ArrowRight, Layers } from "lucide-react";
import TagsClient from "./tags-client";

export default function TagsPage() {
    const tags = getAllTags();
        return <TagsClient tags={tags} />;
 }
