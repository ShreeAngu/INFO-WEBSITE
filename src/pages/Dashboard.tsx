import React from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { data } = useData();

  const todayTasks = data.tasks.filter(t => t.category === 'Today');
  const completedToday = todayTasks.filter(t => t.status === 'Done').length;
  const progress = todayTasks.length > 0 ? (completedToday / todayTasks.length) * 100 : 0;
  
  const totalTasksDone = data.tasks.filter(t => t.status === 'Done').length;

  const calculateStreak = () => {
    const dates = Array.from(new Set(data.journal.map(j => new Date(j.date).toISOString().split('T')[0])))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(today);
    
    if (!dates.includes(checkDate.toISOString().split('T')[0])) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (!dates.includes(checkDate.toISOString().split('T')[0])) {
        return 0;
      }
    }
    
    while (dates.includes(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  };
  
  const activeStreak = calculateStreak();

  const sortedProjects = [...data.projects].sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  const recentProjects = sortedProjects.slice(0, 2);
  const recentJournal = data.journal.slice(0, 2);

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}.`}
        description="Here is what's happening in your workspace today."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Quick Stats */}
        <Card gradient className="p-6 md:col-span-2">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="text-[12px] uppercase tracking-[0.05em] text-white/40 mb-3 font-semibold">Today's Progress</div>
              <p className="text-white/50 mt-1 text-sm">You have completed {completedToday} out of {todayTasks.length} tasks today.</p>
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-white/80">Completion</span>
                <span className="text-white/60">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Streak/Activity */}
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <div className="text-[12px] uppercase tracking-[0.05em] text-white/40 mb-3 font-semibold self-start w-full text-left">Active Streak</div>
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <h3 className="text-[28px] font-bold text-white flex items-baseline gap-1">{activeStreak} <span className="text-sm opacity-40 font-normal">days</span></h3>
            <p className="text-emerald-500 text-xs mt-1">{totalTasksDone} total tasks completed</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] uppercase tracking-[0.05em] text-white/40 font-semibold">Today's Focus</h2>
            <Link to="/productivity" className="text-sm text-white/50 hover:text-white">View all</Link>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-white/50 text-sm">No tasks for today. Enjoy your day!</p>
            ) : (
              todayTasks.map(task => (
                <Card key={task.id} className="p-4 flex items-start gap-4">
                  {task.status === 'Done' ? (
                    <div className="h-4 w-4 border border-indigo-500 bg-indigo-500 rounded shrink-0 mt-0.5 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 border border-white/30 rounded shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === 'Done' ? 'text-white/40 line-through' : 'text-white/80'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-white/40 mt-1 truncate">{task.description}</p>
                    )}
                  </div>
                  <Badge variant={
                    task.priority === 'High' ? 'danger' : 
                    task.priority === 'Medium' ? 'warning' : 'default'
                  }>
                    {task.priority}
                  </Badge>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recent Journal & Projects */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] uppercase tracking-[0.05em] text-white/40 font-semibold">Active Projects</h2>
              <Link to="/projects" className="text-sm text-white/50 hover:text-white">View all</Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {recentProjects.map(project => (
                <Card key={project.id} className="p-4 group cursor-pointer hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-[15px] text-white group-hover:text-white">{project.name}</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-2">{project.description}</p>
                  <div className="flex gap-1">
                    {project.techStack.slice(0,2).map(tech => (
                       <span key={tech} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/50">{tech}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] uppercase tracking-[0.05em] text-white/40 font-semibold">Journal Timeline</h2>
              <Link to="/journal" className="text-sm text-white/50 hover:text-white">View all</Link>
            </div>
            <div className="space-y-4 pl-3">
              {recentJournal.map(entry => (
                <div key={entry.id} className="border-l-2 border-white/10 pl-3 mb-4">
                  <div className="text-[11px] text-white/30 mb-1">{new Date(entry.date).toLocaleDateString()}</div>
                  <div className="text-[13px] leading-relaxed text-white/80">{entry.title} - {entry.description.slice(0, 50)}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
