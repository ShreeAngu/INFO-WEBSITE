import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FlaskConical, BookOpen, CheckSquare, Target, GitCommit, User, LogIn, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Projects', to: '/projects', icon: FolderKanban },
  { name: 'Unpublished Projects', to: '/experiments', icon: FlaskConical },
  { name: 'Journal', to: '/journal', icon: BookOpen },
  { name: 'To Do', to: '/todo', icon: CheckSquare },
  { name: 'Skills', to: '/skills', icon: Target },
  { name: 'Timeline', to: '/timeline', icon: GitCommit },
  { name: 'About', to: '/about', icon: User },
];

export function Sidebar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className={cn(
      "flex h-screen flex-col border-r border-white/10 bg-black/40 backdrop-blur-md py-8 sticky top-0 z-20 transition-all duration-300",
      isCollapsed ? "w-20 px-3" : "w-64 px-4"
    )}>
      <div className={cn("mb-10 flex items-center justify-between", isCollapsed ? "flex-col gap-4 px-0" : "px-2")}>
        {!isCollapsed ? (
          <h1 className="text-[11px] font-bold tracking-widest uppercase text-white/90 truncate mr-2">SHREE ANGU ARUNACHALAM</h1>
        ) : (
          <h1 className="text-[11px] font-bold tracking-widest uppercase text-white/90 bg-white/10 px-1.5 py-0.5 rounded text-center">SAA</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "",
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
                {!isCollapsed && <span className="z-10 truncate">{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-5 border-t border-white/10 flex flex-col gap-3">
        {user ? (
          <div className={cn("flex flex-col", isCollapsed ? "items-center px-0" : "px-3 py-2")}>
            {!isCollapsed && (
              <span className="text-xs text-white/40 mb-2 truncate max-w-full block" title={user.email || ''}>
                {user.email}
              </span>
            )}
            <button
              onClick={logout}
              title={isCollapsed ? "Sign Out" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-all text-left",
                isCollapsed ? "justify-center h-11 w-11 hover:bg-white/5" : "py-2 w-full"
              )}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            title={isCollapsed ? "Admin Sign In" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-all text-left",
              isCollapsed ? "justify-center h-11 w-11 hover:bg-white/5 px-0 mx-auto" : "px-3 py-2 w-full hover:bg-white/5"
            )}
          >
            <LogIn className="h-4 w-4" />
            {!isCollapsed && <span>Admin Sign In</span>}
          </button>
        )}
      </div>
    </div>
  );
}
