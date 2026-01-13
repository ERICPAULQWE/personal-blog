import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime";

/**
 * 在目录中递归查找文件
 */
function findFile(dir: string, filename: string): string | null {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // 1. 优先在当前层级找（兼容 assets）
    for (const entry of entries) {
        if (entry.isFile() && entry.name === filename) {
            return path.join(dir, entry.name);
        }
    }

    // 2. 递归进入所有子目录查找（支持 notes 下的笔记同名文件夹）
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const found = findFile(path.join(dir, entry.name), filename);
            if (found) return found;
        }
    }
    return null;
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ path: string[] }> }
) {
    const params = await props.params;

    // 关键点：Next.js 15 的 params 会自动解码大部分字符，
    // 但为了保险（处理某些特殊字符），我们再取数组最后一项并清理
    let filename = params.path[params.path.length - 1];

    // 解码中文并移除可能残留的宽度标识 (如 image.jpg|200)
    filename = decodeURIComponent(filename).split("|")[0];

    if (filename.includes("..")) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    // 搜索范围：整个 content 目录
    const CONTENT_ROOT = path.join(process.cwd(), "content");
    const filePath = findFile(CONTENT_ROOT, filename);

    if (!filePath || !fs.existsSync(filePath)) {
        console.warn(`[Image API] 404: 找不到文件 "${filename}" (搜索目录: ${CONTENT_ROOT})`);
        return new NextResponse("Image not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = mime.getType(filePath) || "application/octet-stream";

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}