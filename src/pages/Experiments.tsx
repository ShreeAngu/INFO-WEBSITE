import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Forms';
import { Experiment } from '../types';
import { motion } from 'motion/react';
import { TestTubeDiagonal, AlertTriangle, Lightbulb, Trash2, Pencil, Calendar, HelpCircle } from 'lucide-react';
import { formatDate } from '../lib/utils';

export function Experiments() {
  const { data, addItem, deleteItem, updateItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [detailExperiment, setDetailExperiment] = useState<Experiment | null>(null);

  const [formData, setFormData] = useState<Partial<Experiment>>({
    title: '',
    goal: '',
    whatITried: '',
    whyItFailed: '',
    lessonsLearned: '',
    futureImprovements: '',
    completedAt: ''
  });

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

  const handleEditClick = (exp: Experiment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    setDetailExperiment(null); // Close detail view if editing
    setIsAddOpen(true);
  };

  const handleDeleteClick = (exp: Experiment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteItem('experiments', exp.id);
      setDetailExperiment(null); // Close detail view if deleted
    }
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
        {sortedExperiments.map((exp, i) => (
          <motion.div 
            key={exp.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setDetailExperiment(exp)}
            className="cursor-pointer group flex flex-col h-full"
            layout="position"
          >
            <Card className="flex-1 flex flex-col hover:border-white/20 transition-all duration-300 bg-white/[0.01] hover:bg-white/[0.03]">
              {/* Card Header (Compact representation) */}
              <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 group-hover:text-amber-300 transition-colors rounded-lg border border-amber-500/10">
                    <TestTubeDiagonal className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white/95 group-hover:text-white transition-colors">{exp.title}</h2>
                    <p className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {exp.completedAt 
                        ? `Finished: ${formatDate(exp.completedAt)}` 
                        : `Logged: ${formatDate(exp.date)}`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card Body Goal */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Project Goal</h3>
                  <p className="text-[13px] text-white/70 leading-relaxed line-clamp-2">
                    {exp.goal}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Unpublished Project / Experiment Detail Modal */}
      <Modal isOpen={!!detailExperiment} onClose={() => setDetailExperiment(null)} title="Research & Analysis Report">
        {detailExperiment && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/10">
                  <TestTubeDiagonal className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white/95">{detailExperiment.title}</h2>
                  <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {detailExperiment.completedAt 
                      ? `Concluded on ${formatDate(detailExperiment.completedAt)}` 
                      : `Logged on ${formatDate(detailExperiment.date)}`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Goal Section */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" /> The Goal
              </h3>
              <p className="text-white/80 text-[14px] leading-relaxed whitespace-pre-wrap">{detailExperiment.goal}</p>
            </div>

            {/* What I Tried Section */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">What Was Attempted</h3>
              <p className="text-white/80 text-[14px] leading-relaxed whitespace-pre-wrap">{detailExperiment.whatITried}</p>
            </div>

            {/* Why It Failed (Did not work) and Lessons Learned */}
            {(detailExperiment.whyItFailed || detailExperiment.lessonsLearned) && (
              <div className="grid grid-cols-1 gap-4 pt-2">
                {detailExperiment.whyItFailed && (
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-2">
                      <AlertTriangle className="h-4 w-4" /> Why It Didn't Work
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{detailExperiment.whyItFailed}</p>
                  </div>
                )}
                {detailExperiment.lessonsLearned && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
                      <Lightbulb className="h-4 w-4" /> Lessons Learned
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{detailExperiment.lessonsLearned}</p>
                  </div>
                )}
              </div>
            )}

            {/* Future Improvements */}
            {detailExperiment.futureImprovements && (
              <div className="space-y-1.5 pt-2">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Future Countermeasures / Improvements</h3>
                <p className="text-white/80 text-[14px] leading-relaxed whitespace-pre-wrap">{detailExperiment.futureImprovements}</p>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="text-white/40 hover:text-white/90 hover:bg-white/5 px-3 py-1.5"
                onClick={() => handleEditClick(detailExperiment)}
                title="Edit Report"
              >
                <Pencil className="h-4 w-4 mr-1.5" /> Edit
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5"
                onClick={() => handleDeleteClick(detailExperiment)}
                title="Delete Report"
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
