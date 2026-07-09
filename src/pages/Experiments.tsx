import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Forms';
import { Experiment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { TestTubeDiagonal, AlertTriangle, Lightbulb, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../lib/utils';

export function Experiments() {
  const { data, addItem, deleteItem, updateItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<Experiment>>({
    title: '',
    goal: '',
    whatITried: '',
    whyItFailed: '',
    lessonsLearned: '',
    futureImprovements: '',
    completedAt: ''
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNewClick = () => {
    setEditingExperiment(null);
    setFormData({
      title: '',
      goal: '',
      whatITried: '',
      whyItFailed: '',
      lessonsLearned: '',
      futureImprovements: '',
      completedAt: ''
    });
    setIsAddOpen(true);
  };

  const handleEditClick = (exp: Experiment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExperiment(exp);
    setFormData({
      title: exp.title,
      goal: exp.goal,
      whatITried: exp.whatITried,
      whyItFailed: exp.whyItFailed || '',
      lessonsLearned: exp.lessonsLearned || '',
      futureImprovements: exp.futureImprovements || '',
      completedAt: exp.completedAt || ''
    });
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.goal || !formData.whatITried) return;

    if (editingExperiment) {
      const { id, date, ...rest } = editingExperiment;
      updateItem('experiments', editingExperiment.id, {
        ...rest,
        ...formData
      });
    } else {
      addItem('experiments', {
        id: crypto.randomUUID(),
        ...formData,
        date: new Date().toISOString()
      } as Experiment);
    }
    
    setIsAddOpen(false);
    setEditingExperiment(null);
    setFormData({ title: '', goal: '', whatITried: '', whyItFailed: '', lessonsLearned: '', futureImprovements: '', completedAt: '' });
  };

  // Chronological order: newest completion or logged date first
  const sortedExperiments = [...data.experiments].sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.date).getTime();
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.date).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Unpublished Projects" 
        description="A research notebook of hypotheses, attempts, and the lessons learned from things that didn't go as planned."
        actionLabel="New Project"
        onAction={handleNewClick}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sortedExperiments.map((exp, i) => {
          const isExpanded = !!expandedIds[exp.id];
          return (
            <motion.div 
              key={exp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleExpand(exp.id)}
              className="cursor-pointer group flex flex-col h-full"
              layout="position"
            >
              <Card className="flex-1 flex flex-col hover:border-white/20 transition-all duration-300">
                {/* Header Section (Always Visible) */}
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                      <TestTubeDiagonal className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-semibold text-white/90">{exp.title}</h2>
                      <p className="text-[11px] text-white/40">
                        {exp.completedAt 
                          ? `Finished: ${formatDate(exp.completedAt)}` 
                          : `Logged: ${formatDate(exp.date)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-white/40 group-hover:text-white/80 transition-colors flex items-center gap-2">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                
                {/* Body Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Goal (Always Visible) */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.05em] mb-2">The Goal</h3>
                    <p className={`text-[13px] text-white/70 leading-relaxed ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>{exp.goal}</p>
                  </div>

                  {/* Expanded Content Section */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden space-y-4 pt-4 border-t border-white/5"
                        onClick={(e) => e.stopPropagation()} // Prevent collapse on interacting with contents
                      >
                        {exp.whatITried && (
                          <div>
                            <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.05em] mb-2">What I Tried</h3>
                            <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{exp.whatITried}</p>
                          </div>
                        )}

                        {exp.whyItFailed && (
                          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-[12px] text-rose-400 font-medium mb-2">
                              <AlertTriangle className="h-4 w-4" /> Why It Didn't Work
                            </div>
                            <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{exp.whyItFailed}</p>
                          </div>
                        )}

                        {exp.lessonsLearned && (
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-[12px] text-emerald-400 font-medium mb-2">
                              <Lightbulb className="h-4 w-4" /> Lessons Learned
                            </div>
                            <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{exp.lessonsLearned}</p>
                          </div>
                        )}

                        {exp.futureImprovements && (
                          <div>
                            <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.05em] mb-2">Future Improvements</h3>
                            <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">{exp.futureImprovements}</p>
                          </div>
                        )}

                        {/* Action buttons (only visible when expanded) */}
                        <div className="pt-2 flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white/40 hover:text-white/90 hover:bg-white/5 p-2"
                            onClick={(e) => handleEditClick(exp, e)}
                            title="Edit Project"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
                            onClick={(e) => {
                              if (confirm('Are you sure you want to delete this project?')) {
                                deleteItem('experiments', exp.id);
                              }
                            }}
                            title="Delete Project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingExperiment ? "Edit Project" : "Log Project"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Project Title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
            <Input 
              label="Date of Completion" 
              type="date"
              value={formData.completedAt || ''} 
              onChange={e => setFormData({...formData, completedAt: e.target.value})} 
            />
          </div>
          <Textarea 
            label="The Goal" 
            value={formData.goal} 
            onChange={e => setFormData({...formData, goal: e.target.value})} 
            required 
          />
          <Textarea 
            label="What I Tried" 
            value={formData.whatITried} 
            onChange={e => setFormData({...formData, whatITried: e.target.value})} 
            required 
          />
          <Textarea 
            label="Why It Didn't Work (Optional)" 
            value={formData.whyItFailed} 
            onChange={e => setFormData({...formData, whyItFailed: e.target.value})} 
          />
          <Textarea 
            label="Lessons Learned (Optional)" 
            value={formData.lessonsLearned} 
            onChange={e => setFormData({...formData, lessonsLearned: e.target.value})} 
          />
          <Textarea 
            label="Future Improvements (Optional)" 
            value={formData.futureImprovements || ''} 
            onChange={e => setFormData({...formData, futureImprovements: e.target.value})} 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">{editingExperiment ? "Update Project" : "Save Project"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
