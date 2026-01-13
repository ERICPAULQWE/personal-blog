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
    } catch { // 修复：直接使用不带变量的 catch 块
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
    const finalContent = isBase64 ? content : Buffer.from(content, 'utf-8').toString("base64");

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