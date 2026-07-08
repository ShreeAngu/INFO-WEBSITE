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
import { GripVertical, Trash2 } from 'lucide-react';

export function Todo() {
  const { data, addItem, updateItem, deleteItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    priority: 'Medium',
    status: 'Todo',
    category: 'Today',
    progress: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Today', 'Tomorrow', 'This Week', 'Later'] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addItem('tasks', {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString()
    } as Task);
    
    setIsAddOpen(false);
    setFormData({ title: '', priority: 'Medium', status: 'Todo', category: 'Today', progress: 0, date: new Date().toISOString().split('T')[0] });
  };

  const toggleTask = (task: Task) => {
    updateItem('tasks', task.id, {
      status: task.status === 'Done' ? 'Todo' : 'Done',
      progress: task.status === 'Done' ? 0 : 100
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
        onAction={() => setIsAddOpen(true)}
      />

      <div className="space-y-12">
        {categories.map(category => {
          const categoryTasks = data.tasks.filter(t => t.category === category);
          
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
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn("text-[14px] font-medium", task.status === 'Done' ? "text-white/40 line-through" : "text-white/90")}>
                            {task.title}
                          </p>
                          {task.date && (
                            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                              {formatDate(task.date)}
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Task Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
            autoFocus
          />
          <Input 
            label="Description (Optional)" 
            value={formData.description || ''} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
          <Input 
            type="date"
            label="Date"
            value={formData.date || ''}
            onChange={e => setFormData({...formData, date: e.target.value})}
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
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
