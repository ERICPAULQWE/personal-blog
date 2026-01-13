import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateRepoFile } from "@/lib/github";

interface UploadFile {
    path: string;
    content: string;
    isBase64?: boolean;
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { files } = (await req.json()) as { files: UploadFile[] };

        for (const file of files) {
            await updateRepoFile(
                file.path,
                file.content,
                `Upload ${file.path}`,
                file.isBase64
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("GitHub Upload Error:", message);
        return new NextResponse(message, { status: 500 });
    }
}