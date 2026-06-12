import TaskCard from "./TaskCard";
import type { Task } from "../../types/task";
import {
  ListTodo,
  Clock3,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";

interface ColumnProps {
  title: string;
  status: "todo" | "progress" | "done";
  tasks: Task[];
  onDrop: (status: Task["status"]) => void;
  onDragStart: (task: Task) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
}

function Column({
  title,
  status,
  tasks,
  onDrop,
  onDragStart,
  onDelete,
  onEdit,
}: ColumnProps) {
  const getIcon = () => {
    switch (status) {
      case "todo":
        return <ListTodo className="h-6 w-6 text-blue-600" />;

      case "progress":
        return <Clock3 className="h-6 w-6 text-amber-500" />;

      case "done":
        return (
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        );

      default:
        return null;
    }
  };

  const getHeaderStyle = () => {
    switch (status) {
      case "todo":
        return "bg-blue-50 border-blue-100";

      case "progress":
        return "bg-amber-50 border-amber-100";

      case "done":
        return "bg-green-50 border-green-100";

      default:
        return "";
    }
  };

  const getBadgeStyle = () => {
    switch (status) {
      case "todo":
        return "bg-blue-100 text-blue-700";

      case "progress":
        return "bg-amber-100 text-amber-700";

      case "done":
        return "bg-green-100 text-green-700";

      default:
        return "";
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(status)}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b p-5 ${getHeaderStyle()}`}
      >
        <div className="flex items-center gap-3">
          {getIcon()}

          <h3 className="text-xl font-semibold text-slate-900">
            {title}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getBadgeStyle()}`}
          >
            {tasks.length}
          </span>
        </div>

        <button className="text-slate-500 hover:text-slate-700">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Tasks */}
      <div className="min-h-[500px] p-4">
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="mt-4 flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-sm text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default Column;