import { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Column from "./Column";
import type { Task } from "../../types/task";
import { supabase } from "../../lib/supabase";
function Board() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "priority">("latest");
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      console.log("👤 Getting current user...");
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("❌ Error getting user:", error);
        setLoading(false);
        return;
      }
      
      console.log("✅ Current user:", user?.id);
      setCurrentUser(user?.id || null);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", _event, session?.user?.id);
      setCurrentUser(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load tasks from Supabase when user changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) {
        console.log("⚠️ No current user, skipping task load");
        return;
      }

      console.log("📥 Loading tasks for user:", currentUser);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", currentUser);

      if (error) {
        console.error("❌ Error loading tasks:", error);
        return;
      }

      console.log(`✅ Loaded ${data?.length || 0} tasks:`, data);

      // Map due_date to dueDate
      const mappedTasks = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date,
        user_id: t.user_id,
      }));
      
      setTasks(mappedTasks);
    };

    loadTasks();
  }, [currentUser]);

  const handleLogout = async () => {
    console.log("🚪 Logging out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ Logout error:", error);
    } else {
      console.log("✅ Logged out successfully");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      navigate("/");
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      console.log("⚠️ Cannot add empty task");
      return;
    }
    
    if (!currentUser) {
      console.error("❌ No user logged in, cannot add task");
      return;
    }

    console.log("➕ Adding task:", { title: newTask, priority, dueDate, user_id: currentUser });

    const { error, data } = await supabase
      .from("tasks")
      .insert({
        title: newTask,
        status: "todo",
        priority,
        due_date: dueDate || null,
        user_id: currentUser,
      })
      .select();

    if (error) {
      console.error("❌ Error adding task:", error);
      alert("Failed to add task. Check console for details.");
      return;
    }

    console.log("✅ Task added successfully:", data);

    if (data && data[0]) {
      const newTaskWithMapping = {
        id: data[0].id,
        title: data[0].title,
        status: data[0].status,
        priority: data[0].priority,
        dueDate: data[0].due_date,
        user_id: data[0].user_id,
      };
      setTasks([...tasks, newTaskWithMapping]);
    }

    setNewTask("");
    setPriority("medium");
    setDueDate("");
  };

  const deleteTask = async (id: number) => {
    console.log("🗑️ Deleting task:", id);
    
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("❌ Error deleting task:", error);
      return;
    }

    console.log("✅ Task deleted successfully");
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = async (id: number, title: string) => {
    console.log("✏️ Editing task:", id, title);
    
    const { error } = await supabase
      .from("tasks")
      .update({ title })
      .eq("id", id);

    if (error) {
      console.error("❌ Error editing task:", error);
      return;
    }

    console.log("✅ Task edited successfully");
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, title } : task
      )
    );
  };

  const onDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const onDrop = async (status: Task["status"]) => {
    if (!draggedTask) return;

    console.log("🔄 Moving task:", draggedTask.id, "to status:", status);

    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", draggedTask.id);

    if (error) {
      console.error("❌ Error updating task status:", error);
      return;
    }

    console.log("✅ Task status updated successfully");
    setTasks(
      tasks.map((task) =>
        task.id === draggedTask.id ? { ...task, status } : task
      )
    );
    setDraggedTask(null);
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesPriority =
        filter === "all" ? true : task.priority === filter;

      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "latest") {
        return b.id - a.id;
      }

      if (sortBy === "oldest") {
        return a.id - b.id;
      }

      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      return 0;
    });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl">Loading...</div>
          <div className="text-sm text-gray-500">Checking authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-5xl font-bold text-slate-900">
              TaskFlow Board
            </h2>
            <p className="mt-2 text-slate-500">
              Logged in as: {currentUser || "Not logged in"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Total tasks in state: {tasks.length}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Add Task */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Plus
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addTask();
                  }
                }}
                placeholder="Enter task..."
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "high" | "medium" | "low")
              }
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3"
            />

            <button
              onClick={addTask}
              className="rounded-xl bg-blue-600 px-8 py-3 font-medium text-white shadow-md transition hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "high" | "medium" | "low")
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-3"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "latest" | "oldest" | "priority")
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-3"
          >
            <option value="latest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h4 className="text-sm text-slate-500">Total Tasks</h4>
            <p className="mt-2 text-3xl font-bold">{tasks.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h4 className="text-sm text-slate-500">To Do</h4>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {tasks.filter((task) => task.status === "todo").length}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h4 className="text-sm text-slate-500">In Progress</h4>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {tasks.filter((task) => task.status === "progress").length}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h4 className="text-sm text-slate-500">Done</h4>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {tasks.filter((task) => task.status === "done").length}
            </p>
          </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Column
            title="To Do"
            status="todo"
            tasks={filteredTasks.filter((task) => task.status === "todo")}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDelete={deleteTask}
            onEdit={editTask}
          />
          <Column
            title="In Progress"
            status="progress"
            tasks={filteredTasks.filter((task) => task.status === "progress")}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDelete={deleteTask}
            onEdit={editTask}
          />
          <Column
            title="Done"
            status="done"
            tasks={filteredTasks.filter((task) => task.status === "done")}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        </div>
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Task Progress</h3>
          <span className="font-medium text-blue-600">{progress}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {completedTasks} / {totalTasks} Tasks Completed
        </p>
      </div>
      </div>
    </section>
  );
}

export default Board;