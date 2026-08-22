import React, { useEffect, useRef } from 'react';

export const ParticleWave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle wave configuration
    const cols = 55;
    const rows = 35;
    const spacingX = 28;
    const spacingY = 22;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      step += 0.025;

      const originX = width * 0.28;
      const originY = height * 0.72;

      for (let ix = 0; ix < cols; ix++) {
        for (let iy = 0; iy < rows; iy++) {
          // Perspective projection
          const depth = 1 + (iy / rows) * 2.2;
          const x = (ix - cols / 2) * spacingX * depth + originX;
          
          // Wave equation
          const wave1 = Math.sin(ix * 0.18 + step) * 24;
          const wave2 = Math.cos(iy * 0.22 + step * 0.8) * 20;
          const wave3 = Math.sin((ix + iy) * 0.12 + step * 0.5) * 15;
          const waveHeight = wave1 + wave2 + wave3;

          const y = (iy * spacingY * depth * 0.75) + originY + waveHeight;

          // Alpha fade off based on distance & edges
          const alphaBase = (iy / rows) * 0.65;
          const edgeFade = Math.sin((ix / cols) * Math.PI);
          const alpha = Math.max(0, Math.min(1, alphaBase * edgeFade * 0.9));

          if (alpha > 0.02 && x >= 0 && x <= width && y >= 0 && y <= height) {
            const radius = Math.max(0.6, (1.2 + (iy / rows) * 1.8));

            // Cyan to royal blue particle gradient
            const isCyan = (ix + iy) % 3 === 0;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = isCyan
              ? `rgba(56, 189, 248, ${alpha})`
              : `rgba(37, 99, 235, ${alpha * 0.85})`;
            ctx.fill();

            // Connect nearby points with faint lines
            if (ix < cols - 1 && iy % 2 === 0) {
              const nextDepth = 1 + (iy / rows) * 2.2;
              const nextX = (ix + 1 - cols / 2) * spacingX * nextDepth + originX;
              const nextWave1 = Math.sin((ix + 1) * 0.18 + step) * 24;
              const nextWave = nextWave1 + wave2 + Math.sin((ix + 1 + iy) * 0.12 + step * 0.5) * 15;
              const nextY = (iy * spacingY * nextDepth * 0.75) + originY + nextWave;

              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(nextX, nextY);
              ctx.strokeStyle = `rgba(37, 99, 235, ${alpha * 0.22})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
