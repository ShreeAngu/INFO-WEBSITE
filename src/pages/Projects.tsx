import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Forms';
import { Project } from '../types';
import { Github, ExternalLink, Code2, Trash2, Pencil, AlertTriangle, Lightbulb, Calendar, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../lib/utils';

export function Projects() {
  const { data, addItem, deleteItem, updateItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'In Progress',
    techStack: [],
    challenges: '',
    learnings: '',
    completedAt: '',
    githubUrl: '',
    liveUrl: ''
  });
  const [techInput, setTechInput] = useState('');

  const handleNewClick = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'In Progress',
      techStack: [],
      challenges: '',
      learnings: '',
      completedAt: '',
      githubUrl: '',
      liveUrl: ''
    });
    setTechInput('');
    setIsAddOpen(true);
  };

  const handleEditClick = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      techStack: project.techStack || [],
      challenges: project.challenges || '',
      learnings: project.learnings || '',
      completedAt: project.completedAt || '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || ''
    });
    setTechInput('');
    setDetailProject(null); // Close detail view if opening editor
    setIsAddOpen(true);
  };

  const handleDeleteClick = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteItem('projects', project.id);
      setDetailProject(null); // Close detail view if deleted
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    if (editingProject) {
      const { id, createdAt, ...rest } = editingProject;
      updateItem('projects', editingProject.id, {
        ...rest,
        ...formData
      });
    } else {
      addItem('projects', {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString()
      } as Project);
    }
    
    setIsAddOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'In Progress', techStack: [], completedAt: '', githubUrl: '', liveUrl: '' });
  };

  const addTech = () => {
    if (techInput.trim() && !formData.techStack?.includes(techInput.trim())) {
      setFormData(prev => ({ ...prev, techStack: [...(prev.techStack || []), techInput.trim()] }));
      setTechInput('');
    }
  };

  // Chronological order: newest completion or creation date first
  const sortedProjects = [...data.projects].sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Projects" 
        description="A showcase of what I've built and what I'm currently working on."
        actionLabel="New Project"
        onAction={handleNewClick}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedProjects.map((project, i) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setDetailProject(project)}
            className="cursor-pointer group flex flex-col h-full"
            layout="position"
          >
            <Card className="flex-1 flex flex-col hover:border-white/20 transition-all duration-300 bg-white/[0.01] hover:bg-white/[0.03]">
              <div className="p-6 flex-1 flex flex-col justify-between">
                {/* Card Top */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/95 transition-colors border border-white/5">
                        <Code2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-[15px] font-semibold text-white/90 group-hover:text-white transition-colors">{project.name}</h2>
                        <p className="text-[12px] text-white/40 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {project.completedAt 
                            ? `Completed: ${formatDate(project.completedAt)}` 
                            : `Started: ${formatDate(project.createdAt)}`
                          }
                        </p>
                      </div>
                    </div>
                    <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'On Hold' ? 'warning' : 'info'}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <p className="text-white/60 text-[13px] leading-relaxed line-clamp-3 mb-4">
                    {project.description}
                  </p>
                </div>

                {/* Card Footer (Short tags) */}
                <div className="pt-4 border-t border-white/5 flex items-center">
                  <div className="flex gap-1.5 overflow-hidden max-w-full">
                    {project.techStack?.slice(0, 3).map(tech => (
                      <span key={tech} className="px-1.5 py-0.5 bg-white/5 text-white/40 text-[10px] rounded border border-white/5 truncate">
                        {tech}
                      </span>
                    ))}
                    {project.techStack && project.techStack.length > 3 && (
                      <span className="text-[10px] text-white/30 self-center">+{project.techStack.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detail View Modal (Project Popup) */}
      <Modal isOpen={!!detailProject} onClose={() => setDetailProject(null)} title="Project Showcase">
        {detailProject && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white/95">{detailProject.name}</h2>
                <p className="text-sm text-white/40 flex items-center gap-1.5 mt-1">
                  <Calendar className="h-4 w-4" />
                  {detailProject.completedAt 
                    ? `Completed on ${formatDate(detailProject.completedAt)}` 
                    : `Started on ${formatDate(detailProject.createdAt)}`
                  }
                </p>
              </div>
              <Badge variant={detailProject.status === 'Completed' ? 'success' : detailProject.status === 'On Hold' ? 'warning' : 'info'}>
                {detailProject.status}
              </Badge>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">About Project</h3>
              <p className="text-white/80 text-[14px] leading-relaxed whitespace-pre-wrap">{detailProject.description}</p>
            </div>

            {/* Tech Stack */}
            {detailProject.techStack && detailProject.techStack.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" /> Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detailProject.techStack.map(tech => (
                    <span key={tech} className="px-2.5 py-1 bg-white/5 text-white/70 text-xs rounded-md border border-white/10">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Challenges and Lessons Learned */}
            {(detailProject.challenges || detailProject.learnings) && (
              <div className="grid grid-cols-1 gap-4 pt-2">
                {detailProject.challenges && (
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-2">
                      <AlertTriangle className="h-4 w-4" /> Challenges Faced
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{detailProject.challenges}</p>
                  </div>
                )}
                {detailProject.learnings && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
                      <Lightbulb className="h-4 w-4" /> Key Learnings
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{detailProject.learnings}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center flex-wrap gap-3">
              <div className="flex gap-2">
                {detailProject.githubUrl && (
                  <a 
                    href={detailProject.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Github className="h-4 w-4" /> Code Repository
                    </Button>
                  </a>
                )}
                {detailProject.liveUrl && (
                  <a 
                    href={detailProject.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white">
                      <ExternalLink className="h-4 w-4" /> Live Site Demo
                    </Button>
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="text-white/40 hover:text-white/90 hover:bg-white/5 px-3 py-1.5"
                  onClick={() => handleEditClick(detailProject)}
                  title="Edit Project"
                >
                  <Pencil className="h-4 w-4 mr-1.5" /> Edit
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5"
                  onClick={() => handleDeleteClick(detailProject)}
                  title="Delete Project"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title={editingProject ? "Edit Project" : "Add New Project"}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input 
              label="Completion Date" 
              type="date"
              value={formData.completedAt || ''} 
              onChange={e => setFormData({...formData, completedAt: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="GitHub URL (Optional)" 
              value={formData.githubUrl || ''} 
              onChange={e => setFormData({...formData, githubUrl: e.target.value})} 
              placeholder="https://github.com/..."
            />
            <Input 
              label="Live Demo URL (Optional)" 
              value={formData.liveUrl || ''} 
              onChange={e => setFormData({...formData, liveUrl: e.target.value})} 
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea 
              label="Challenges Faced (Optional)" 
              value={formData.challenges || ''} 
              onChange={e => setFormData({...formData, challenges: e.target.value})} 
            />
            <Textarea 
              label="Key Learnings (Optional)" 
              value={formData.learnings || ''} 
              onChange={e => setFormData({...formData, learnings: e.target.value})} 
            />
          </div>

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
            <Button type="submit">{editingProject ? "Update Project" : "Save Project"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
