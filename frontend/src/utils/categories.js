import React from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  Wind, 
  Droplet, 
  Lightbulb, 
  HelpCircle 
} from 'lucide-react';

export const CATEGORIES = [
  {
    id: 'Potholes',
    name: 'Potholes',
    description: 'Road craters, surface cracks, sunken asphalt, or uneven tarmac',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    defaultPriority: 'High',
  },
  {
    id: 'Garbage',
    name: 'Garbage',
    description: 'Overflowing dumpsters, roadside debris, or uncollected municipal waste',
    icon: Trash2,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    defaultPriority: 'Medium',
  },
  {
    id: 'Road Dust',
    name: 'Road Dust',
    description: 'Construction silt, unpaved shoulders, and airborne particulate hazards',
    icon: Wind,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    defaultPriority: 'Medium',
  },
  {
    id: 'Water Leakage',
    name: 'Water Leakage',
    description: 'Burst pipelines, sewage overflows, open drain leakages, or waterlogging',
    icon: Droplet,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    defaultPriority: 'High',
  },
  {
    id: 'Streetlights',
    name: 'Streetlights',
    description: 'Flickering or dark streetlamps, exposed wiring, and junction outages',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    defaultPriority: 'Medium',
  },
];

export function getCategoryMeta(categoryName) {
  const found = CATEGORIES.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
  return found || {
    id: categoryName,
    name: categoryName || 'Other',
    description: 'Civic issue',
    icon: HelpCircle,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    defaultPriority: 'Medium'
  };
}
