import type { Config } from "tailwindcss";

export default {
        cream: '#FAFAFD',
        ink: '#1A1625',
        primary: '#8B5CF6',
        secondary: '#A78BFA',
        accentPink: '#F472B6',
        accentBlue: '#60A5FA',
        lavender: '#F6F2FF',
        pink: '#FDF4FF',
        border: '#E7E2F0',
        muted: '#9A94B2',
        textMuted: "#948DA8",
        cardBg: "rgba(255,255,255,0.72)",
        elevatedBg: "#FCFBFF",
        glowWhite: "rgba(255,255,255,0.65)"
      },
      fontFamily: {
        xl: '20px',
        full: '999px',
        card: '20px',
        input: '14px',
        button: '999px',
      },
      boxShadow: {
        card: '0 8px 32px 0 rgba(139,92,246,0.10)',
        glow: '0 0 120px 0 rgba(139,92,246,0.18)',
        input: '0 2px 8px #CFAEFF11',
        button: '0 2px 8px #8B5CF622',
      },
      backgroundImage: {
        "ai-grid": "linear-gradient(rgba(124,58,237,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.1) 1px, transparent 1px)",
        "light-glow": "radial-gradient(ellipse at 60% 20%, #CFAEFF55 0%, #BFE3FF33 60%, #F4B6D922 100%)"
        'glow-lavender': 'radial-gradient(ellipse 80% 60% at 10% 0%, #C7BFFF 0%, #FAFAFD 80%, transparent 100%)',
        'glow-pink': 'radial-gradient(ellipse 60% 40% at 90% 100%, #F472B6 0%, #FAFAFD 80%, transparent 100%)',
        'glow-blue': 'radial-gradient(ellipse 60% 40% at 50% 100%, #60A5FA 0%, #FAFAFD 80%, transparent 100%)',
      },
      borderRadius: {
        'panel': '24px',
        'card': '24px',
        'input': '18px',
        'button': '18px',
      }
    }
  },
  plugins: []
} satisfies Config;
