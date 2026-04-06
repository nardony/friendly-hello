import { useEffect, useState } from 'react';

interface StatCardProps {
  value: string;
  label: string;
  suffix?: string;
}

export const StatCard = ({ value, label, suffix = '+' }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseInt(value.replace(/\D/g, '')) || 0;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <div className="text-center p-3 sm:p-4 md:p-6 bg-card/30 border border-border/30 rounded-xl sm:rounded-2xl backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
      <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground text-xs sm:text-sm">{label}</div>
    </div>
  );
};
