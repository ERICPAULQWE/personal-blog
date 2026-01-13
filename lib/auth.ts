import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ profile }) {
            const allowedUser = process.env.ADMIN_GITHUB_USER;
            // 这里的 profile 类型手动指定为带有 login 的对象
            const githubProfile = profile as { login?: string };
            const loginName = githubProfile?.login;

            if (
                loginName &&
                allowedUser &&
                loginName.toLowerCase() === allowedUser.toLowerCase()
            ) {
                return true;
            }

            return false;
        },
    },
};