import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Forms';
import { Skill } from '../types';
import { motion } from 'motion/react';

export function Skills() {
  const { data, addItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Skill>>({
    name: '',
    category: 'Programming',
    proficiency: 50
  });

  const categories = ['Programming', 'AI/ML', 'Frameworks', 'Cloud', 'Databases', 'Tools'] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addItem('skills', {
      id: crypto.randomUUID(),
      ...formData,
    } as Skill);
    
    setIsAddOpen(false);
    setFormData({ name: '', category: 'Programming', proficiency: 50 });
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Skills & Expertise" 
        description="A quantitative overview of my technical capabilities and proficiency levels."
        actionLabel="Add Skill"
        onAction={() => setIsAddOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(category => {
          const catSkills = data.skills.filter(s => s.category === category).sort((a, b) => b.proficiency - a.proficiency);
          if (catSkills.length === 0) return null;

          return (
            <Card key={category} className="p-6">
              <h2 className="text-[12px] font-semibold text-white/40 uppercase tracking-[0.05em] mb-6">{category}</h2>
              <div className="space-y-6">
                {catSkills.map(skill => (
                  <div key={skill.id}>
                    <div className="flex justify-between items-end mb-2 text-sm">
                      <span className="font-medium text-white/80">{skill.name}</span>
                      <span className="text-[11px] text-white/50">{skill.proficiency}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Skill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Skill Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <Select 
            label="Category" 
            options={categories.map(c => ({ label: c, value: c }))}
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as any})}
          />
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Proficiency ({formData.proficiency}%)
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={formData.proficiency}
              onChange={e => setFormData({...formData, proficiency: parseInt(e.target.value)})}
              className="w-full accent-zinc-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Skill</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
