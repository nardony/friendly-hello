interface ToolProgressBarProps {
  enabled: boolean;
  label: string;
  percentage: number;
}

export const ToolProgressBar = ({ enabled, label, percentage }: ToolProgressBarProps) => {
  if (!enabled) return null;

  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
          {label}
        </span>
        <div className="w-40 md:w-64 h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${clampedPct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-primary whitespace-nowrap">
          {clampedPct}%
        </span>
      </div>
    </div>
  );
};
