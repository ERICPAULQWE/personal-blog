import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime"; // 你可能需要安装: npm install mime @types/mime

// 辅助函数：在目录中递归查找文件
function findFile(dir: string, filename: string): string | null {
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

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    // params.path 是数组，例如 ['my-image.png'] 或者 ['subdir', 'image.png']
    // Obsidian 通常是扁平引用 [[image.png]]，但也可能带路径
    const filename = params.path[params.path.length - 1];

    // 安全检查：防止遍历上级目录
    if (filename.includes("..") || params.path.some(p => p.includes(".."))) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    const NOTES_DIR = path.join(process.cwd(), "content");

    // 在 content 目录下递归查找该文件
    // 注意：如果不同文件夹有同名图片，这里会返回找到的第一个。
    // 如果你的图片引用带有路径（如 [[assets/img.png]]），逻辑需要调整。
    // 这里假设是标准的 Obsidian 扁平引用。
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