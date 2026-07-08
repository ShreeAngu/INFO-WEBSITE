import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, BookOpen, CheckSquare, Target, GitCommit, User, LogIn, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Projects', to: '/projects', icon: FolderKanban },
  { name: 'Experiments', to: '/experiments', icon: FlaskConical },
  { name: 'Journal', to: '/journal', icon: BookOpen },
  { name: 'Productivity', to: '/productivity', icon: CheckSquare },
  { name: 'Skills', to: '/skills', icon: Target },
  { name: 'Timeline', to: '/timeline', icon: GitCommit },
  { name: 'About', to: '/about', icon: User },
];

export function Sidebar() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md px-4 py-8 sticky top-0 z-20">
      <div className="mb-10 px-2 flex items-center">
        <h1 className="text-[13px] font-bold tracking-widest uppercase text-white/90">SHREE ANGU ARUNACHALAM</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-white/5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 z-10 transition-colors", isActive ? "text-white" : "text-white/50 group-hover:text-white/80")} />
                <span className="z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-5 border-t border-white/10 flex flex-col gap-3">
        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all w-full text-left"
          >
            <LogIn className="h-4 w-4" />
            <span>Admin Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}
