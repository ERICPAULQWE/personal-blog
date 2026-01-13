import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteRepoFile, deleteRepoDirRecursive } from "@/lib/github";

type DeleteBody = {
    path: string;                 // file: content/notes/... .md   dir: content/notes/...
    type: "file" | "dir";
};

function normalizePath(p: string) {
    // 去掉开头的 /
    const n = p.replace(/^\/+/, "").replace(/\\/g, "/").trim();
    // 禁止 path traversal
    if (!n || n.includes("..")) throw new Error("Invalid path");
    return n;
}

function assertAllowedNotesPath(p: string) {
    // ✅ 只允许操作 content/notes 下的内容
    if (!p.startsWith("content/notes/")) throw new Error("Forbidden path");
}

function toDirPath(p: string) {
    // 允许传 content/notes/xx 或 content/notes/xx/
    return p.endsWith("/") ? p.slice(0, -1) : p;
}

function getAssetDirFromMdPath(mdPath: string) {
    // md: content/notes/<dir>/<name>.md
    // asset dir: content/notes/<dir>/<name>/
    if (!mdPath.endsWith(".md")) throw new Error("path must end with .md");
    return `${mdPath.slice(0, -3)}/`;
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = (await req.json()) as DeleteBody;

        if (!body?.path || !body?.type) {
            return new NextResponse("path and type are required", { status: 400 });
        }

        const path = normalizePath(body.path);
        assertAllowedNotesPath(path);

        // ✅ 删除单个文件：只允许 .md；同时删同名资源目录
        if (body.type === "file") {
            if (!path.endsWith(".md")) {
                return new NextResponse("Only .md file allowed", { status: 400 });
            }

            // 1) 删 md 文件（幂等：不存在则 skipped）
            const mdRes = await deleteRepoFile(path, `Delete note ${path}`);

            // 2) 删同名资源目录：content/notes/.../name/
            const assetDir = getAssetDirFromMdPath(path);
            assertAllowedNotesPath(assetDir);

            const dirRes = await deleteRepoDirRecursive(toDirPath(assetDir));

            return NextResponse.json({
                success: true,
                mode: "file",
                assetDir,
                deleted: [...(mdRes.skipped ? [] : [path]), ...dirRes.deleted],
                skipped: [...(mdRes.skipped ? [path] : []), ...dirRes.skipped],
            });
        }

        // ✅ 删除目录：递归删除目录下所有文件/子目录文件
        if (body.type === "dir") {
            const dirPath = toDirPath(path);
            assertAllowedNotesPath(dirPath);

            const dirRes = await deleteRepoDirRecursive(dirPath);

            return NextResponse.json({
                success: true,
                mode: "dir",
                dirPath,
                deleted: dirRes.deleted,
                skipped: dirRes.skipped,
            });
        }

        return new NextResponse("Invalid type", { status: 400 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("GitHub Delete Error:", message);
        return new NextResponse(message, { status: 500 });
    }
}
