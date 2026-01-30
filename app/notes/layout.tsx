import { ImmersiveProvider } from "@/components/reading/immersive-context";

export default function NotesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 仅作为一个纯粹的容器返回 children
    return <ImmersiveProvider>{children}</ImmersiveProvider>;
}