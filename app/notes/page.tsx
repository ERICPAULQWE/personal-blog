import { getAllNotes } from "@/lib/content";
import { buildFileTree } from "@/lib/tree";
import { NotesLayoutClient } from "@/components/notes-layout-client";
import NotesClient from "./notes-client";

export default function NotesPage() {
    const notes = getAllNotes();
    const tree = buildFileTree(notes);

    return (
        <NotesLayoutClient tree={tree}>
            <NotesClient notes={notes} />
        </NotesLayoutClient>
    );
}
