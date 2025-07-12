import React, { useEffect, useRef } from 'react';

const DitherBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;

    const drawDither = (time: number) => {
      // Reduce frame rate to 30fps for better performance
      frameRef.current++;
      if (frameRef.current % 2 !== 0) {
        animationId = requestAnimationFrame(drawDither);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const dotSize = 3;
      const spacing = 8; // Increased spacing for better performance
      const waveOffset = time * 0.001;
      
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const distance = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2)
          );
          
          const wave1 = Math.sin(distance * 0.01 + waveOffset) * 0.5 + 0.5;
          const wave2 = Math.sin(x * 0.02 + waveOffset * 1.5) * 0.5 + 0.5;
          const wave3 = Math.sin(y * 0.015 + waveOffset * 0.8) * 0.5 + 0.5;
          
          const intensity = (wave1 + wave2 + wave3) / 3;
          const alpha = intensity * 0.2; // Reduced opacity
          
          // Reduce random calculations for better performance
          if (Math.random() < intensity * 0.7) {
            ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.fillRect(x, y, dotSize, dotSize);
          }
        }
      }
      
      animationId = requestAnimationFrame(drawDither);
    };

    animationId = requestAnimationFrame(drawDither);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full opacity-30 dark:opacity-40"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    />
  );
};

export default DitherBackground;