const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

// 1. Rewrite index.css
const indexCss = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background: linear-gradient(135deg, #f8fbff 0%, #eef7ff 45%, #f8f5ff 100%);
    @apply text-slate-800 font-sans antialiased min-h-screen overflow-x-hidden;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-300 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-400;
}

@layer components {
  .glass-panel {
    @apply bg-white/80 backdrop-blur-xl border border-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)];
  }
  
  .glass-card {
    @apply bg-white/90 backdrop-blur-lg border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
    @apply text-white font-bold px-6 py-2.5 rounded-[14px] transition-all duration-300 shadow-[0_8px_20px_rgba(0,210,255,0.3)] hover:shadow-[0_12px_25px_rgba(0,210,255,0.4)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2;
  }

  .btn-secondary {
    @apply bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm font-medium px-6 py-2.5 rounded-[14px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2;
  }
  
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500;
  }
  
  .text-gradient-primary {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-[#00d2ff] to-[#8a2be2];
  }
}

/* 3D and Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

.perspective-1000 {
  perspective: 1000px;
}

.preserve-3d {
  transform-style: preserve-3d;
}

.card-3d {
  transform: translateZ(20px);
  transition: transform 0.3s ease;
}

.group:hover .card-3d {
  transform: translateZ(40px) translateY(-5px);
}

.bg-glow-primary {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0,210,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-secondary {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(138,43,226,0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
`;

fs.writeFileSync(path.join(srcDir, 'index.css'), indexCss);

console.log('Finished updating CSS');
