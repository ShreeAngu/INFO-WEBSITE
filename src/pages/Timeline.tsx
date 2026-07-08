import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Forms';
import { TimelineEvent } from '../types';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { GraduationCap, Briefcase, Award, FolderKanban, Star, Trash2 } from 'lucide-react';

export function Timeline() {
  const { data, addItem, deleteItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    title: '',
    type: 'Project',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addItem('timeline', {
      id: crypto.randomUUID(),
      ...formData,
    } as TimelineEvent);
    
    setIsAddOpen(false);
    setFormData({ title: '', type: 'Project', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Education': return <GraduationCap className="h-5 w-5" />;
      case 'Internship': return <Briefcase className="h-5 w-5" />;
      case 'Certification': return <Award className="h-5 w-5" />;
      case 'Achievement': return <Star className="h-5 w-5" />;
      default: return <FolderKanban className="h-5 w-5" />;
    }
  };

  const sortedTimeline = [...data.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Journey" 
        description="A timeline of my professional growth, education, and milestones."
        actionLabel="Add Milestone"
        onAction={() => setIsAddOpen(true)}
      />

      <div className="relative border-l border-white/10 ml-6 space-y-8 pb-8">
        {sortedTimeline.map((event, i) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-8 md:pl-10"
          >
            <div className="absolute -left-[26px] top-1 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#050505] bg-white/5 text-white/50 backdrop-blur-md">
              {getIcon(event.type)}
            </div>
            
            <Card className="p-6 relative group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <h3 className="text-[18px] font-semibold text-white/90">{event.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium px-2.5 py-1 bg-white/5 rounded-full text-white/50 w-fit">
                    {formatDate(event.date)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this event?')) {
                        deleteItem('timeline', event.id);
                      }
                    }}
                    title="Delete Event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-4 block">
                {event.type}
              </span>
              <p className="text-[13px] text-white/70 leading-relaxed">{event.description}</p>
            </Card>
          </motion.div>
        ))}
        {sortedTimeline.length === 0 && (
          <div className="pl-10 text-white/40">No timeline events yet.</div>
        )}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Milestone">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
          />
          <Select 
            label="Type" 
            options={[
              {label: 'Project', value: 'Project'},
              {label: 'Education', value: 'Education'},
              {label: 'Internship', value: 'Internship'},
              {label: 'Certification', value: 'Certification'},
              {label: 'Achievement', value: 'Achievement'},
            ]}
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
          />
          <Input 
            type="date"
            label="Date" 
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
            required 
          />
          <Textarea 
            label="Description" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            required 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Milestone</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
