import { Play } from 'lucide-react';
import { useState, useRef } from 'react';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';

export const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { settings } = useHomepageSettings();
  const hideControls = settings.sections_visibility.video_hide_controls;

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm group">
          <div className="relative w-full aspect-video">
            <video
              ref={videoRef}
              src="/videos/0403.mp4"
              className="w-full h-full object-cover"
              controls={isPlaying && !hideControls}
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              playsInline
              preload="metadata"
              loop
              onContextMenu={(e) => e.preventDefault()}
            />
            {!isPlaying && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center cursor-pointer" onClick={handlePlay}>
                <button
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary glow-primary flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-0.5 sm:ml-1" fill="currentColor" />
                </button>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
};
