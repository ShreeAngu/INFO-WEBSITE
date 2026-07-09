import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Forms';
import { Project } from '../types';
import { Github, ExternalLink, Code2, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/utils';

export function Projects() {
  const { data, addItem, deleteItem, updateItem } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

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

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
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
    setIsAddOpen(true);
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
        {sortedProjects.map((project, i) => {
          const isExpanded = !!expandedIds[project.id];
          return (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleExpand(project.id)}
              className="cursor-pointer group flex flex-col h-full"
              layout="position"
            >
              <Card className="flex-1 flex flex-col hover:border-white/20 transition-all duration-300">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Card Header (Always Visible) */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/90 transition-colors border border-white/5">
                        <Code2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-[15px] font-semibold text-white/90">{project.name}</h2>
                        <p className="text-[12px] text-white/40">
                          {project.completedAt 
                            ? `Completed: ${formatDate(project.completedAt)}` 
                            : `Started: ${formatDate(project.createdAt)}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'On Hold' ? 'warning' : 'info'}>
                        {project.status}
                      </Badge>
                      <div className="text-white/40 group-hover:text-white/80 transition-colors">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                  
                  {/* Truncated Description (Collapsed) or Full Description (Expanded) */}
                  <div className="flex-1">
                    <p className={`text-white/60 text-[13px] leading-relaxed mb-4 ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                      {project.description}
                    </p>
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
                        onClick={(e) => e.stopPropagation()} // Prevent collapse when interacting with contents
                      >
                        {project.techStack && project.techStack.length > 0 && (
                          <div>
                            <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.05em] mb-1.5">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                              {project.techStack.map(tech => (
                                <span key={tech} className="px-2 py-1 bg-white/5 text-white/50 text-[10px] rounded border border-white/10">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {(project.challenges || project.learnings) && (
                          <div className="grid grid-cols-1 gap-3 pt-2">
                            {project.challenges && (
                              <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                                <h4 className="text-[11px] font-semibold text-rose-400 uppercase tracking-[0.05em] mb-1">Challenges</h4>
                                <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{project.challenges}</p>
                              </div>
                            )}
                            {project.learnings && (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                                <h4 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.05em] mb-1">Learnings</h4>
                                <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{project.learnings}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-2 flex justify-between gap-3 items-center">
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <a 
                                href={project.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button variant="secondary" size="sm" className="gap-2 text-xs">
                                  <Github className="h-4 w-4" /> Code
                                </Button>
                              </a>
                            )}
                            {project.liveUrl && (
                              <a 
                                href={project.liveUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button variant="secondary" size="sm" className="gap-2 text-xs">
                                  <ExternalLink className="h-4 w-4" /> Live Demo
                                </Button>
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-white/40 hover:text-white/90 hover:bg-white/5 p-2"
                              onClick={(e) => handleEditClick(project, e)}
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
                                  deleteItem('projects', project.id);
                                }
                              }}
                              title="Delete Project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
