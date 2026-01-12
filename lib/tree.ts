import { Note } from "./content";

export type TreeNode = {
  name: string;
  slug: string; // 完整路径，用于链接
  type: "file" | "folder";
  children: TreeNode[];
};

export function buildFileTree(notes: Note[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const note of notes) {
    const parts = note.slug.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      
      let existing = currentLevel.find((n) => n.name === part && n.type === (isFile ? "file" : "folder"));

      if (!existing) {
        existing = {
          name: part,
          slug: parts.slice(0, i + 1).join("/"),
          type: isFile ? "file" : "folder",
          children: [],
        };
        currentLevel.push(existing);
      }

      // 如果是文件夹，进入下一层
      if (!isFile) {
        currentLevel = existing.children;
      }
    }
  }

  // 排序：文件夹在前，文件在后；同类按名称排序
  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });
    nodes.forEach((n) => sortTree(n.children));
  };

  sortTree(root);
  return root;
}
