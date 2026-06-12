import { LogIn, LayoutDashboard } from "lucide-react";

function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-blue-600">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Task<span className="text-blue-600">Flow</span>
          </h1>
        </div>

        {/* Login Button */}
        <button className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-white shadow-md transition-all hover:bg-slate-800">
          <LogIn size={18} />
          <span className="font-medium">Login</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;