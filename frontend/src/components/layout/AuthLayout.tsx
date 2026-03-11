import { Outlet } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — dark brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-indigo-400" />
          <span className="text-xl font-bold tracking-tight">ProjectAI</span>
        </div>
        <div className="space-y-4">
          <blockquote className="text-3xl font-semibold leading-snug">
            "Intelligent project management powered by AI and voice."
          </blockquote>
          <p className="text-zinc-400 text-sm">
            Automate task reporting, monitor progress in real time, and make
            smarter decisions — all in one platform.
          </p>
        </div>
        <p className="text-zinc-600 text-sm">© 2026 ProjectAI. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <BrainCircuit className="h-6 w-6 text-indigo-500" />
            <span className="text-lg font-bold">ProjectAI</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
