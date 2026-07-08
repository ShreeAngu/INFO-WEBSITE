import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Forms';
import { Project } from '../types';
import { Github, ExternalLink, Code2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Projects() {
  const { data, addItem, deleteItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'In Progress',
    techStack: [],
    challenges: '',
    learnings: ''
  });
  const [techInput, setTechInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    addItem('projects', {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date().toISOString()
    } as Project);
    
    setIsAddOpen(false);
    setFormData({ name: '', description: '', status: 'In Progress', techStack: [] });
  };

  const addTech = () => {
    if (techInput.trim() && !formData.techStack?.includes(techInput.trim())) {
      setFormData(prev => ({ ...prev, techStack: [...(prev.techStack || []), techInput.trim()] }));
      setTechInput('');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Projects" 
        description="A showcase of what I've built and what I'm currently working on."
        actionLabel="New Project"
        onAction={() => setIsAddOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.projects.map((project, i) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full flex flex-col hover:border-white/20 transition-all duration-300 group">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/90 transition-colors border border-white/5">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-white/90">{project.name}</h2>
                      <p className="text-[12px] text-white/40">{new Date(project.createdAt).getFullYear()}</p>
                    </div>
                  </div>
                  <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'On Hold' ? 'warning' : 'info'}>
                    {project.status}
                  </Badge>
                </div>
                
                <p className="text-white/60 text-[13px] mb-6 flex-1 leading-relaxed">{project.description}</p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-white/5 text-white/50 text-[10px] rounded border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between gap-3">
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <Button variant="ghost" size="sm" className="gap-2 text-xs">
                          <Github className="h-4 w-4" /> Code
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button variant="ghost" size="sm" className="gap-2 text-xs">
                          <ExternalLink className="h-4 w-4" /> Live Demo
                        </Button>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this project?')) {
                          deleteItem('projects', project.id);
                        }
                      }}
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Project">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Project Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <Textarea 
            label="Description" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            required 
          />
          <Select 
            label="Status" 
            options={[
              {label: 'In Progress', value: 'In Progress'},
              {label: 'Completed', value: 'Completed'},
              {label: 'On Hold', value: 'On Hold'},
            ]}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value as any})}
          />
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={techInput} 
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                placeholder="e.g. React"
              />
              <Button type="button" variant="secondary" onClick={addTech}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.techStack?.map(tech => (
                <Badge key={tech} className="gap-1">
                  {tech}
                  <button type="button" onClick={() => setFormData(p => ({...p, techStack: p.techStack?.filter(t => t !== tech)}))}>
                    <span className="sr-only">Remove</span>
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Save Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
