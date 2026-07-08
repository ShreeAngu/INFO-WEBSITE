import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Forms';
import { Experiment } from '../types';
import { motion } from 'motion/react';
import { TestTubeDiagonal, AlertTriangle, Lightbulb } from 'lucide-react';
import { formatDate } from '../lib/utils';

export function Experiments() {
  const { data, addItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Experiment>>({
    title: '',
    goal: '',
    whatITried: '',
    whyItFailed: '',
    lessonsLearned: '',
    futureImprovements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addItem('experiments', {
      id: crypto.randomUUID(),
      ...formData,
      date: new Date().toISOString()
    } as Experiment);
    
    setIsAddOpen(false);
    setFormData({ title: '', goal: '', whatITried: '', whyItFailed: '', lessonsLearned: '' });
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Experiments" 
        description="A research notebook of hypotheses, attempts, and the lessons learned from things that didn't go as planned."
        actionLabel="New Experiment"
        onAction={() => setIsAddOpen(true)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {data.experiments.map((exp, i) => (
          <motion.div 
            key={exp.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full flex flex-col hover:border-white/20 transition-colors">
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <TestTubeDiagonal className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-white/90">{exp.title}</h2>
                    <p className="text-[11px] text-white/40">{formatDate(exp.date)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6 flex-1">
                <div>
                  <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.05em] mb-2">The Goal</h3>
                  <p className="text-[13px] text-white/70 leading-relaxed">{exp.goal}</p>
                </div>
                
                <div>
                  <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.05em] mb-2">What I Tried</h3>
                  <p className="text-[13px] text-white/70 leading-relaxed">{exp.whatITried}</p>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[12px] text-rose-400 font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" /> Why It Didn't Work
                  </div>
                  <p className="text-[13px] text-white/70 leading-relaxed">{exp.whyItFailed}</p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[12px] text-emerald-400 font-medium mb-2">
                    <Lightbulb className="h-4 w-4" /> Lessons Learned
                  </div>
                  <p className="text-[13px] text-white/70 leading-relaxed">{exp.lessonsLearned}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Experiment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Experiment Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
          />
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
            label="Why It Didn't Work" 
            value={formData.whyItFailed} 
            onChange={e => setFormData({...formData, whyItFailed: e.target.value})} 
            required 
          />
          <Textarea 
            label="Lessons Learned" 
            value={formData.lessonsLearned} 
            onChange={e => setFormData({...formData, lessonsLearned: e.target.value})} 
            required 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Experiment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
