import { getAllNotes } from "../../lib/content";
import { buildFileTree } from "../../lib/tree";
import { NotesLayoutClient } from "../../components/notes-layout-client";

export default function NotesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const notes = getAllNotes();
    const tree = buildFileTree(notes);

    return <NotesLayoutClient tree={tree}>{children}</NotesLayoutClient>;
}