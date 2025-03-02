// Type Definitions
export interface Task {
  id: number;
  text: string;
  memo: string;
  expanded: boolean;
  markdownEnabled: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

export interface TaskWithStatus extends Task {
  status: "todo" | "progress" | "completed";
}

export interface TaskItemProps {
  task: Task;
  list: string;
  index: number;
  handleDragStart: (e: React.DragEvent, id: number, fromList: string) => void;
  moveTask: (
    id: number,
    fromList: string,
    toList: "todo" | "progress" | "completed"
  ) => void;
  toggleExpand: (id: number, list: string) => void;
  editMode: EditModeState | null;
  editMemo: string;
  setEditMemo: React.Dispatch<React.SetStateAction<string>>;
  saveMemo: () => void;
  changePriority: (
    id: number,
    list: string,
    priority: "low" | "medium" | "high"
  ) => void;
  startEditMemo: (id: number, list: string) => void;
  deleteTask: (id: number, list: string) => void;
}

export interface TaskListProps {
  title: string;
  list: "todo" | "progress" | "completed";
  tasks: Task[];
  emptyMessage: string;
}

export interface TodoLists {
  todo: Task[];
  progress: Task[];
  completed: Task[];
}

export interface EditModeState {
  id: number;
  list: string;
}

export type ViewMode = "kanban" | "notepad";
