import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAllNotes } from "@/lib/content";
import { buildFileTree } from "@/lib/tree";
import AdminDeleteClient from "./ui";

export default async function AdminDeletePage() {
    const session = await getServerSession();

    // 路由守卫（跟 /admin 一致） :contentReference[oaicite:6]{index=6}
    if (!session || !session.user) redirect("/api/auth/signin");

    const notes = getAllNotes();
    const tree = buildFileTree(notes); // Notes 页也是这么构建树 :contentReference[oaicite:7]{index=7}

    return <AdminDeleteClient tree={tree} />;
}
