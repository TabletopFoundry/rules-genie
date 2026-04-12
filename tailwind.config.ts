import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: {
          ink: '#1F2937',
          canvas: '#FFF8EE',
          mist: '#F6EFD9',
          forest: '#1D6B55',
          pine: '#0F3D31',
          gold: '#F4B740',
          berry: '#A63A50',
          lake: '#3C82F6'
        }
      },
      boxShadow: {
        card: '0 18px 40px rgba(15, 61, 49, 0.12)'
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at top, rgba(244,183,64,0.14), transparent 40%), linear-gradient(rgba(29,107,85,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(29,107,85,0.05) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: 'auto, 24px 24px, 24px 24px'
      }
    }
  },
  plugins: []
};

export default config;
