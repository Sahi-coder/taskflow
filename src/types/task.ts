export type Task = {
  id: number;
  title: string;
  status: "todo" | "progress" | "done";
  priority: "high" | "medium" | "low";
  dueDate?: string;
};