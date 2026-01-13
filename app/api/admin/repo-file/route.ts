import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readRepoFile } from "@/lib/github";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    if (!path) return new NextResponse("Missing path", { status: 400 });

    try {
        const content = await readRepoFile(path);
        return NextResponse.json({ content });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("GitHub Read Error:", message);
        return new NextResponse(message, { status: 500 });
    }
}
