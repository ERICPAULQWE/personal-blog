import { Octokit } from "octokit";

const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
});

const OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO = process.env.GITHUB_REPO_NAME!;
const BRANCH = process.env.GITHUB_BRANCH || "main";

async function getFileSha(path: string): Promise<string | undefined> {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path,
            ref: BRANCH,
        });

        if (Array.isArray(data)) return undefined;
        return (data as { sha: string }).sha;
    } catch {
        return undefined;
    }
}

export async function updateRepoFile(
    path: string,
    content: string,
    message: string,
    isBase64: boolean = false
) {
    const sha = await getFileSha(path);
    const finalContent = isBase64
        ? content
        : Buffer.from(content, "utf-8").toString("base64");

    await octokit.rest.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path,
        message,
        content: finalContent,
        sha,
        branch: BRANCH,
    });

    return { success: true };
}

/** ✅ 删除单个文件（幂等：不存在则 skipped） */
export async function deleteRepoFile(path: string, message?: string) {
    const sha = await getFileSha(path);
    if (!sha) return { success: true, skipped: true };

    await octokit.rest.repos.deleteFile({
        owner: OWNER,
        repo: REPO,
        path,
        message: message ?? `Delete ${path}`,
        sha,
        branch: BRANCH,
    });

    return { success: true, skipped: false };
}

export type RepoContentItem = {
    type: "file" | "dir";
    path: string;
};

/** GitHub content list item（避免 any） */
type GitHubContentListItem = {
    type: "file" | "dir" | "symlink" | "submodule";
    path: string;
};

/** ✅ 列出目录内容（不存在/非目录则返回空） */
export async function listRepoDir(dirPath: string): Promise<RepoContentItem[]> {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: dirPath,
            ref: BRANCH,
        });

        if (!Array.isArray(data)) return [];

        return (data as GitHubContentListItem[]).map((it) => ({
            type: it.type === "dir" ? "dir" : "file",
            path: it.path,
        }));
    } catch {
        return [];
    }
}

/** ✅ 递归删除目录下所有文件/子目录（GitHub 无“删目录”，删完文件目录自然消失） */
export async function deleteRepoDirRecursive(dirPath: string) {
    const items = await listRepoDir(dirPath);
    const deleted: string[] = [];
    const skipped: string[] = [];

    for (const it of items) {
        if (it.type === "file") {
            const res = await deleteRepoFile(it.path);
            (res.skipped ? skipped : deleted).push(it.path);
        } else {
            const sub = await deleteRepoDirRecursive(it.path);
            deleted.push(...sub.deleted);
            skipped.push(...sub.skipped);
        }
    }

    return { deleted, skipped };
}

/**  读取单个文件内容（UTF-8） */
export async function readRepoFile(path: string): Promise<string> {
    const { data } = await octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path,
        ref: BRANCH,
    });

    if (Array.isArray(data) || !("content" in data)) {
        throw new Error("Not a file");
    }

    const encoded = (data as { content: string }).content; // base64（可能带换行）
    const cleaned = encoded.replace(/\n/g, "");
    return Buffer.from(cleaned, "base64").toString("utf-8");
}