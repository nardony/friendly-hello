import { LucideIcon } from 'lucide-react';

interface TrustBadgeProps {
  icon: LucideIcon;
  text: string;
  href?: string;
}

export const TrustBadge = ({ icon: Icon, text, href }: TrustBadgeProps) => {
  const classes = "flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2 backdrop-blur-sm transition-colors hover:bg-card/80";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes + " cursor-pointer"}>
        <Icon className="w-4 h-4 text-accent" />
        <span className="text-sm text-muted-foreground">{text}</span>
      </a>
    );
  }

  return (
    <div className={classes}>
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};
