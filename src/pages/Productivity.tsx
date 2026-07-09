import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Forms';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Pencil, Bell } from 'lucide-react';

export function Todo() {
  const { data, addItem, updateItem, deleteItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Todo',
    category: 'Today',
    progress: 0,
    date: new Date().toISOString().split('T')[0],
    hasReminder: false,
    reminderTime: '09:00',
    isRecurring: false,
    recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completedDays: {}
  });

  const categories = ['Today', 'Tomorrow', 'This Week', 'Later'] as const;

  // Auto-categorizes based on the completion date
  const getCategoryFromDate = (dateStr: string): 'Today' | 'Tomorrow' | 'This Week' | 'Later' => {
    if (!dateStr) return 'Today';
    
    // Use local values to avoid timezone conversion offsets
    const selected = new Date(dateStr + 'T00:00:00');
    
    // Get local date for today at midnight
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays > 1 && diffDays <= 7) {
      return 'This Week';
    } else {
      return 'Later';
    }
  };

  const handleDateChange = (newDate: string) => {
    const autoCategory = getCategoryFromDate(newDate);
    setFormData(prev => ({
      ...prev,
      date: newDate,
      category: autoCategory
    }));
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Todo',
      category: 'Today',
      progress: 0,
      date: new Date().toISOString().split('T')[0],
      hasReminder: false,
      reminderTime: '09:00',
      isRecurring: false,
      recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      completedDays: {}
    });
    setIsAddOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      category: task.category,
      progress: task.progress,
      date: task.date,
      hasReminder: task.hasReminder || false,
      reminderTime: task.reminderTime || '09:00',
      isRecurring: task.isRecurring || false,
      recurringDays: task.recurringDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      completedDays: task.completedDays || {}
    });
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const finalData = { ...formData };
    if (finalData.isRecurring) {
      finalData.category = 'Today';
      finalData.date = new Date().toISOString().split('T')[0];
      if (!finalData.recurringDays || finalData.recurringDays.length === 0) {
        finalData.recurringDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      }
    }

    if (editingTask) {
      const { id, createdAt, ...rest } = editingTask;
      updateItem('tasks', editingTask.id, {
        ...rest,
        ...finalData
      });
    } else {
      addItem('tasks', {
        id: crypto.randomUUID(),
        ...finalData,
        createdAt: new Date().toISOString()
      } as Task);
    }
    
    setIsAddOpen(false);
    setEditingTask(null);
  };

  const toggleTask = (task: Task) => {
    updateItem('tasks', task.id, {
      status: task.status === 'Done' ? 'Todo' : 'Done',
      progress: task.status === 'Done' ? 0 : 100
    });
  };

  const toggleRecurringTask = (task: Task) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const completedDays = task.completedDays || {};
    const isCompletedToday = !!completedDays[todayStr];
    
    const newCompletedDays = {
      ...completedDays,
      [todayStr]: !isCompletedToday
    };
    
    updateItem('tasks', task.id, {
      completedDays: newCompletedDays
    });
  };

  const priorityColors = {
    High: 'bg-rose-500',
    Medium: 'bg-blue-500',
    Low: 'bg-yellow-500'
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="To Do" 
        description="Organize your day, track priorities, and get things done."
        actionLabel="Add Task"
        onAction={handleAddClick}
      />

      <div className="space-y-12">
        {/* Repetitive Tasks / Daily Reminders Section */}
        {data.tasks && data.tasks.some(t => t.isRecurring) && (
          <div className="space-y-4">
            <h3 className="text-[12px] font-semibold text-indigo-400 uppercase tracking-[0.05em] flex items-center gap-2">
              <Bell className="h-4 w-4" /> Daily Reminders & Repetitive Tasks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.tasks.filter(t => t.isRecurring).map(task => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isCompletedToday = !!task.completedDays?.[todayStr];
                
                const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const todayIndex = (new Date().getDay() + 6) % 7; 
                const todayDayName = daysOfWeek[todayIndex];
                const isActiveToday = task.recurringDays?.includes(todayDayName);

                return (
                  <motion.div
                    key={task.id}
                    layout
                    className={cn(
                      "relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:bg-white/[0.04] backdrop-blur-sm",
                      isCompletedToday 
                        ? "border-emerald-500/20 bg-emerald-500/[0.01] opacity-60" 
                        : isActiveToday 
                          ? "border-indigo-500/20 bg-white/[0.02]" 
                          : "border-white/5 bg-white/[0.01]"
                    )}
                  >
                    {/* Status Indicator pulse */}
                    {isActiveToday && !isCompletedToday && (
                      <div className="absolute right-3 top-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className={cn(
                          "text-[14px] font-medium transition-colors",
                          isCompletedToday ? "text-white/40 line-through" : "text-white/90"
                        )}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[12px] text-white/50 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>

                      {/* Active Days indicator */}
                      <div className="flex gap-1.5 items-center">
                        {daysOfWeek.map(day => {
                          const isScheduled = task.recurringDays?.includes(day);
                          const isToday = day === todayDayName;
                          return (
                            <div
                              key={day}
                              className={cn(
                                "text-[10px] h-6 w-6 rounded-full flex items-center justify-center font-semibold border transition-all",
                                isScheduled 
                                  ? isToday 
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]" 
                                    : "bg-white/10 border-white/10 text-white/80"
                                  : isToday
                                    ? "bg-transparent border-white/5 text-white/30"
                                    : "bg-transparent border-transparent text-white/15"
                              )}
                              title={`${day}${isToday ? ' (Today)' : ''}${isScheduled ? ' - Scheduled' : ' - Rest Day'}`}
                            >
                              {day.substring(0, 1)}
                            </div>
                          );
                        })}
                      </div>

                      {/* Action row */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {task.hasReminder && task.reminderTime ? (
                            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Bell className="h-3 w-3" /> {task.reminderTime}
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/30">No daily alarm</span>
                          )}
                          {!isActiveToday && (
                            <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                              Rest Day
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleRecurringTask(task)}
                            className={cn(
                              "text-[11px] px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 border",
                              isCompletedToday
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                            )}
                          >
                            {isCompletedToday ? "Done Today" : "Mark Done"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditClick(task)}
                            className="text-white/20 hover:text-white transition-colors p-1"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this repetitive task?')) {
                                deleteItem('tasks', task.id);
                              }
                            }}
                            className="text-white/20 hover:text-red-400 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {categories.map(category => {
          const categoryTasks = data.tasks.filter(t => t.category === category && !t.isRecurring);
          
          categoryTasks.sort((a, b) => {
            const priorityWeight = { High: 3, Medium: 2, Low: 1 };
            const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            const dateA = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
            const dateB = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
            return dateA - dateB;
          });

          if (categoryTasks.length === 0 && category !== 'Today') return null;

          return (
            <div key={category} className="space-y-4">
              <h3 className="text-[12px] font-semibold text-white/40 uppercase tracking-[0.05em]">{category}</h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {categoryTasks.map(task => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task.id}
                      className={cn(
                        "relative flex items-center gap-4 rounded-xl border bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] backdrop-blur-sm",
                        task.status === 'Done' ? "border-white/5 opacity-60" : "border-white/10"
                      )}
                    >
                      {/* Priority Marker */}
                      <div className={cn(
                        "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full",
                        priorityColors[task.priority]
                      )} />

                      <div className="flex-1 pl-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className={cn("text-[14px] font-medium", task.status === 'Done' ? "text-white/40 line-through" : "text-white/90")}>
                            {task.title}
                          </p>
                          {task.date && (() => {
                            const selected = new Date(task.date + 'T00:00:00');
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const isOverdue = selected.getTime() < today.getTime() && task.status !== 'Done';
                            
                            return (
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium transition-all",
                                isOverdue 
                                  ? "text-rose-400 bg-rose-400/10 border border-rose-500/20 animate-pulse" 
                                  : "text-white/40 bg-white/5"
                              )}>
                                {isOverdue ? "Overdue / " : ""}Time to Complete: {formatDate(task.date)}
                              </span>
                            );
                          })()}
                          {task.hasReminder && task.reminderTime && (
                            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1" title="Notification scheduled for mobile app">
                              <Bell className="h-3 w-3" /> Mobile Reminder: {task.reminderTime}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-[13px] text-white/50 truncate mt-0.5">{task.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleTask(task)}
                          className={cn(
                            "relative h-5 w-9 shrink-0 rounded-full transition-colors border",
                            task.status === 'Done' ? "bg-indigo-500/20 border-indigo-500" : "bg-white/5 border-white/20"
                          )}
                        >
                          <motion.div 
                            layout
                            className={cn(
                              "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all",
                              task.status === 'Done' ? "left-[18px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "left-0.5 bg-white/50"
                            )}
                          />
                        </button>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="text-white/20 hover:text-white transition-colors p-1"
                            title="Edit Task"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this task?')) {
                                deleteItem('tasks', task.id);
                              }
                            }}
                            className="text-white/20 hover:text-red-400 transition-colors p-1"
                            title="Delete Task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {categoryTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                      No tasks for {category.toLowerCase()}.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingTask ? "Edit Task" : "Add Task"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Task Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
            autoFocus
          />
          <Textarea 
            label="Description (Optional)" 
            value={formData.description || ''} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
          {/* Task Type Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 block">Task Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, isRecurring: false }))}
                className={cn(
                  "py-2 px-3 rounded-lg border text-sm transition-all text-center font-medium",
                  !formData.isRecurring 
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                )}
              >
                One-time Task
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, isRecurring: true }))}
                className={cn(
                  "py-2 px-3 rounded-lg border text-sm transition-all text-center font-medium",
                  formData.isRecurring 
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                )}
              >
                Repetitive Task
              </button>
            </div>
          </div>

          {!formData.isRecurring ? (
            <>
              <Input 
                type="date"
                label="Time to Complete"
                value={formData.date || ''}
                onChange={e => handleDateChange(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Category" 
                  options={[
                    {label: 'Today', value: 'Today'},
                    {label: 'Tomorrow', value: 'Tomorrow'},
                    {label: 'This Week', value: 'This Week'},
                    {label: 'Later', value: 'Later'},
                  ]}
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                />
                <Select 
                  label="Priority" 
                  options={[
                    {label: 'High', value: 'High'},
                    {label: 'Medium', value: 'Medium'},
                    {label: 'Low', value: 'Low'},
                  ]}
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as any})}
                />
              </div>
            </>
          ) : (
            <>
              {/* Day selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 block">Repeat On</label>
                <span className="text-xs text-white/40 block -mt-1 mb-2">Select the days of the week this task should repeat.</span>
                <div className="flex flex-wrap gap-2 justify-between">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const isSelected = formData.recurringDays?.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const current = formData.recurringDays || [];
                          const next = current.includes(day)
                            ? current.filter(d => d !== day)
                            : [...current, day];
                          setFormData(p => ({ ...p, recurringDays: next }));
                        }}
                        className={cn(
                          "h-10 w-10 rounded-full border text-xs transition-all flex items-center justify-center font-semibold",
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                        )}
                      >
                        {day.substring(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Select 
                  label="Priority" 
                  options={[
                    {label: 'High', value: 'High'},
                    {label: 'Medium', value: 'Medium'},
                    {label: 'Low', value: 'Low'},
                  ]}
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as any})}
                />
              </div>
            </>
          )}

          {/* Mobile Reminder Section */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-zinc-300 block">Set Mobile Reminder</label>
                <span className="text-xs text-white/40 block mt-0.5">Note: This will trigger a notification directly in your mobile app.</span>
              </div>
              <button 
                type="button"
                onClick={() => setFormData(p => ({ ...p, hasReminder: !p.hasReminder }))}
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors border",
                  formData.hasReminder ? "bg-indigo-500/20 border-indigo-500" : "bg-white/5 border-white/20"
                )}
              >
                <motion.div 
                  layout
                  className={cn(
                    "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all",
                    formData.hasReminder ? "left-[18px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "left-0.5 bg-white/50"
                  )}
                />
              </button>
            </div>
            {formData.hasReminder && (
              <div className="mt-3">
                <Input 
                  type="time" 
                  label="Reminder Time"
                  value={formData.reminderTime || '09:00'} 
                  onChange={e => setFormData({ ...formData, reminderTime: e.target.value })} 
                  required
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">{editingTask ? "Update Task" : "Save Task"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
