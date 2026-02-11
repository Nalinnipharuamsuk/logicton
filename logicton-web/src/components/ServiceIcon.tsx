import { LucideIcon, Globe, Smartphone, Palette, Layers, Rocket, Cpu, Wrench, Shield, Zap, Code, Film } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Palette,
  Layers,
  Rocket,
  Cpu,
  Wrench,
  Shield,
  Zap,
  Code,
  Film,
};

interface ServiceIconProps {
  iconName: string;
  className?: string;
}

export default function ServiceIcon({ iconName, className = "h-12 w-12" }: ServiceIconProps) {
  const Icon = iconMap[iconName];

  if (!Icon) {
    // Fallback for unknown icons
    return <Code className={className} />;
  }

  return <Icon className={className} />;
}

export { iconMap };
