import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime"; // 确保已安装: npm install mime @types/mime

// 辅助函数：在目录中递归查找文件 (保持不变)
function findFile(dir: string, filename: string): string | null {
    // 检查目录是否存在，防止 fs.readdirSync 报错
    if (!fs.existsSync(dir)) return null;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // 1. 先找当前目录的文件
    for (const entry of entries) {
        if (entry.isFile() && entry.name === filename) {
            return path.join(dir, entry.name);
        }
    }

    // 2. 没找到，再找子目录
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const found = findFile(path.join(dir, entry.name), filename);
            if (found) return found;
        }
    }
    return null;
}

// 核心修改：Next.js 15 要求 params 是 Promise
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ path: string[] }> }
) {
    // 1. 等待 params 解析 (Next.js 15 必须步骤)
    const params = await props.params;

    // params.path 是数组，例如 ['my-image.png'] 或者 ['subdir', 'image.png']
    const filename = params.path[params.path.length - 1];

    // 安全检查：防止遍历上级目录
    if (filename.includes("..") || params.path.some((p) => p.includes(".."))) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    const NOTES_DIR = path.join(process.cwd(), "content");

    // 在 content 目录下递归查找该文件
    const filePath = findFile(NOTES_DIR, filename);

    if (!filePath || !fs.existsSync(filePath)) {
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