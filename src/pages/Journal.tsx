import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Forms';
import { JournalEntry } from '../types';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { BookMarked, Code, BrainCircuit } from 'lucide-react';

export function Journal() {
  const { data, addItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    title: '',
    description: '',
    techUsed: [],
    problemsFaced: '',
    solutions: '',
    keyLearnings: '',
    nextSteps: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addItem('journal', {
      id: crypto.randomUUID(),
      ...formData,
      date: new Date().toISOString()
    } as JournalEntry);
    
    setIsAddOpen(false);
    setFormData({ title: '', description: '', problemsFaced: '', solutions: '', keyLearnings: '' });
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Developer Journal" 
        description="Documenting my daily learnings, challenges, and architectural decisions."
        actionLabel="New Entry"
        onAction={() => setIsAddOpen(true)}
      />

      <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-12 pb-12">
        {data.journal.map((entry, i) => (
          <motion.div 
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-8 md:pl-12"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[11px] top-1.5 h-[21px] w-[21px] rounded-full border-[5px] border-[#050505] bg-white/20" />
            
            <p className="text-[11px] text-white/30 mb-2">{formatDate(entry.date)}</p>
            
            <Card className="p-6 md:p-8 hover:border-white/20 transition-colors">
              <h2 className="text-2xl font-semibold text-white/90 mb-4 tracking-tight">{entry.title}</h2>
              
              <div className="prose prose-invert max-w-none text-[13px] text-white/80 leading-relaxed">
                <ReactMarkdown>{entry.description}</ReactMarkdown>
              </div>

              {(entry.problemsFaced || entry.solutions) && (
                <div className="mt-8 grid gap-6 md:grid-cols-2 pt-6 border-t border-zinc-800/50">
                  {entry.problemsFaced && (
                    <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-rose-400 mb-2 font-medium">
                        <BrainCircuit className="h-4 w-4" /> Challenge
                      </div>
                      <p className="text-sm text-zinc-300">{entry.problemsFaced}</p>
                    </div>
                  )}
                  {entry.solutions && (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-emerald-400 mb-2 font-medium">
                        <Code className="h-4 w-4" /> Solution
                      </div>
                      <p className="text-sm text-zinc-300">{entry.solutions}</p>
                    </div>
                  )}
                </div>
              )}

              {entry.keyLearnings && (
                <div className="mt-6 pt-6 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-blue-400 mb-2 font-medium">
                    <BookMarked className="h-4 w-4" /> Key Learnings
                  </div>
                  <div className="text-sm text-zinc-300">
                    <ReactMarkdown>{entry.keyLearnings}</ReactMarkdown>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
        {data.journal.length === 0 && (
          <div className="pl-8 md:pl-12 text-zinc-500">No journal entries yet.</div>
        )}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Journal Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
          />
          <Textarea 
            label="What did you work on? (Markdown supported)" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            className="min-h-[120px]"
            required 
          />
          <Textarea 
            label="Problems Faced" 
            value={formData.problemsFaced} 
            onChange={e => setFormData({...formData, problemsFaced: e.target.value})} 
          />
          <Textarea 
            label="Solutions / Workarounds" 
            value={formData.solutions} 
            onChange={e => setFormData({...formData, solutions: e.target.value})} 
          />
          <Textarea 
            label="Key Learnings (Markdown supported)" 
            value={formData.keyLearnings} 
            onChange={e => setFormData({...formData, keyLearnings: e.target.value})} 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
