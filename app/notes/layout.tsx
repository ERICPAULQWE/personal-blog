export default function NotesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 移除这里的 NotesLayoutClient 和 buildFileTree
    // 仅作为一个纯粹的容器返回 children
    return <>{children}</>;
}