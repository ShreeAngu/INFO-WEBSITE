import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageHeader({ title, description, actionLabel, onAction }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">{title}</h1>
        <p className="text-white/50">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
