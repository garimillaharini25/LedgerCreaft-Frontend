import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  Activity,
  BookOpen,
  Plane,
  ShoppingCart,
  Home,
  CreditCard,
  Tag,
  Coffee,
  Heart,
  Gift,
  Smartphone,
  Shield,
  Briefcase,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  film: Film,
  'file-text': FileText,
  activity: Activity,
  'book-open': BookOpen,
  plane: Plane,
  'shopping-cart': ShoppingCart,
  home: Home,
  'credit-card': CreditCard,
  tag: Tag,
  coffee: Coffee,
  heart: Heart,
  gift: Gift,
  smartphone: Smartphone,
  shield: Shield,
  briefcase: Briefcase,
};

export function getCategoryIcon(name: string): LucideIcon {
  return iconMap[name.toLowerCase()] || Tag;
}

export function CategoryIconRenderer({
  name,
  className = 'w-4 h-4',
  color,
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  const IconComponent = getCategoryIcon(name);
  return <IconComponent className={className} style={color ? { color } : undefined} />;
}
