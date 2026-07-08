import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Forms';
import { Badge } from '../components/ui/Badge';
import { Edit2, Terminal, Code2, Cpu, Goal } from 'lucide-react';
import { motion } from 'motion/react';

export function About() {
  const { data, updateData } = useData();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState(data.about);

  const [interestInput, setInterestInput] = useState('');
  const [techInput, setTechInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData('about', formData);
    setIsEditOpen(false);
  };

  const addArrayItem = (field: 'interests' | 'favoriteTech', input: string, setInput: (v: string) => void) => {
    if (input.trim() && !formData[field].includes(input.trim())) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], input.trim()] }));
      setInput('');
    }
  };

  const removeArrayItem = (field: 'interests' | 'favoriteTech', item: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter(i => i !== item) }));
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="About Me" 
        description="My background, interests, and current focus."
        actionLabel="Edit Profile"
        onAction={() => {
          setFormData(data.about);
          setIsEditOpen(true);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-white/90">
              <Terminal className="h-5 w-5 text-white/40" />
              <h2 className="text-[15px] font-semibold">Bio</h2>
            </div>
            <p className="text-white/70 leading-relaxed text-[14px]">{data.about.bio}</p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4 text-white/90">
              <Goal className="h-5 w-5 text-white/40" />
              <h2 className="text-[15px] font-semibold">Current Focus & Goals</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] text-white/40 uppercase tracking-[0.05em] font-semibold mb-2">Focus</h3>
                <p className="text-[13px] text-white/70 leading-relaxed">{data.about.currentFocus}</p>
              </div>
              <div>
                <h3 className="text-[10px] text-white/40 uppercase tracking-[0.05em] font-semibold mb-2">Goals</h3>
                <p className="text-[13px] text-white/70 leading-relaxed">{data.about.goals}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 text-white/90">
              <Code2 className="h-5 w-5 text-white/40" />
              <h2 className="text-[14px] font-semibold">Favorite Tech</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.about.favoriteTech.map(tech => (
                <Badge key={tech} variant="default" className="px-2 py-1 text-[11px]">{tech}</Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 text-white/90">
              <Cpu className="h-5 w-5 text-white/40" />
              <h2 className="text-[14px] font-semibold">Interests</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.about.interests.map(interest => (
                <Badge key={interest} variant="info" className="px-2 py-1 text-[11px]">{interest}</Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profile">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Textarea 
            label="Bio" 
            value={formData.bio} 
            onChange={e => setFormData({...formData, bio: e.target.value})} 
            className="min-h-[120px]"
          />
          <Input 
            label="Current Focus" 
            value={formData.currentFocus} 
            onChange={e => setFormData({...formData, currentFocus: e.target.value})} 
          />
          <Input 
            label="Goals" 
            value={formData.goals} 
            onChange={e => setFormData({...formData, goals: e.target.value})} 
          />
          
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Favorite Tech</label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={techInput} 
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem('favoriteTech', techInput, setTechInput); } }}
                placeholder="e.g. React"
              />
              <Button type="button" variant="secondary" onClick={() => addArrayItem('favoriteTech', techInput, setTechInput)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.favoriteTech.map(item => (
                <Badge key={item} className="gap-1">
                  {item}
                  <button type="button" onClick={() => removeArrayItem('favoriteTech', item)}>&times;</button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Interests</label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={interestInput} 
                onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArrayItem('interests', interestInput, setInterestInput); } }}
                placeholder="e.g. UI/UX"
              />
              <Button type="button" variant="secondary" onClick={() => addArrayItem('interests', interestInput, setInterestInput)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map(item => (
                <Badge key={item} className="gap-1">
                  {item}
                  <button type="button" onClick={() => removeArrayItem('interests', item)}>&times;</button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
