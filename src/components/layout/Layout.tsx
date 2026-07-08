import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useData } from '../../context/DataContext';

export function Layout() {
  const { loading } = useData();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#050505]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#050505] relative overflow-hidden">
      {/* Radial Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 40%), radial-gradient(circle at 10% 80%, rgba(168,85,247,0.1) 0%, transparent 40%)'
      }} />
      <Sidebar />
      <main className="flex-1 relative z-10 overflow-y-auto max-h-screen">
        <div className="mx-auto max-w-6xl p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
