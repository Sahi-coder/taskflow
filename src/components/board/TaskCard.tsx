import { useState } from "react";
import {
  Trash2,
  GripVertical,
  Calendar,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { Task } from "../../types/task";

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
}

function TaskCard({
  task,
  onDragStart,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    if (!editedTitle.trim()) return;

    onEdit(task.id, editedTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setIsEditing(false);
  };

  const getPriorityStyle = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-100 text-red-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityText = () => {
    switch (task.priority) {
      case "high":
        return "🔴 High";

      case "medium":
        return "🟡 Medium";

      case "low":
        return "🟢 Low";

      default:
        return "No Priority";
    }
  };

  const getStatusStyle = () => {
    switch (task.status) {
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

  const getStatusText = () => {
    switch (task.status) {
      case "todo":
        return "To Do";

      case "progress":
        return "In Progress";

      case "done":
        return "Done";

      default:
        return "";
    }
  };
const today = new Date();
today.setHours(0, 0, 0, 0);

const dueDateObj = task.dueDate
  ? new Date(`${task.dueDate}T00:00:00`)
  : null;

const isOverdue =
  dueDateObj !== null &&
  dueDateObj.getTime() <= today.getTime() &&
  task.status !== "done";
  return (
    <div
      draggable={!isEditing}
      onDragStart={() => onDragStart(task)}
      className="group cursor-grab rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:cursor-grabbing"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <GripVertical
            size={18}
            className="mt-1 text-slate-400"
          />

          {isEditing ? (
            <input
              value={editedTitle}
              onChange={(e) =>
                setEditedTitle(e.target.value)
              }
              autoFocus
              className="w-full rounded-lg border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h4 className="flex-1 break-words font-medium text-slate-800">
              {task.title}
            </h4>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="rounded-lg p-1 text-green-600 hover:bg-green-50"
              >
                <Check size={16} />
              </button>

              <button
                onClick={handleCancel}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => onDelete(task.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Priority */}
      <div className="mt-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle()}`}
        >
          {getPriorityText()}
        </span>
      </div>

      {/* Overdue */}
      {isOverdue && (
        <div className="mt-3">
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            ⚠ Overdue
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar size={14} />

          <span>
          {task.dueDate
  ? new Date(task.dueDate).toLocaleDateString(
      "en-GB"
    )
  : "No due date"}
          </span>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle()}`}
        >
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;