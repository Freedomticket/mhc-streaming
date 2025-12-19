export type Theme = 'INFERNO' | 'PURGATORIO' | 'PARADISO';

export interface ThemeConfig {
  name: Theme;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    text: string;
    border: string;
    overlay: string;
  };
  gradient: {
    from: string;
    to: string;
  };
  typography: {
    heading: string;
    body: string;
  };
}

export const THEME_CONFIG: Record<Theme, ThemeConfig> = {
  INFERNO: {
    name: 'INFERNO',
    displayName: 'Inferno',
    description: 'Dark, passionate realm of flame and torment',
    colors: {
      primary: '#FF4444',
      secondary: '#CC0000',
      background: '#1a0000',
      accent: '#FFD700',
      text: '#FFFFFF',
      border: '#660000',
      overlay: 'rgba(255, 68, 68, 0.1)',
    },
    gradient: {
      from: '#330000',
      to: '#000000',
    },
    typography: {
      heading: 'font-bold tracking-wider',
      body: 'font-medium',
    },
  },
  PURGATORIO: {
    name: 'PURGATORIO',
    displayName: 'Purgatorio',
    description: 'Transformative realm of growth and redemption',
    colors: {
      primary: '#C7C7C7',
      secondary: '#999999',
      background: '#1a1a1a',
      accent: '#FFD700',
      text: '#FFFFFF',
      border: '#444444',
      overlay: 'rgba(199, 199, 199, 0.1)',
    },
    gradient: {
      from: '#2a2a2a',
      to: '#0a0a0a',
    },
    typography: {
      heading: 'font-bold',
      body: 'font-normal',
    },
  },
  PARADISO: {
    name: 'PARADISO',
    displayName: 'Paradiso',
    description: 'Celestial realm of divine light and harmony',
    colors: {
      primary: '#FFD700',
      secondary: '#FFF8DC',
      background: '#001a1a',
      accent: '#FFFFFF',
      text: '#FFFFFF',
      border: '#FFD700',
      overlay: 'rgba(255, 215, 0, 0.1)',
    },
    gradient: {
      from: '#003333',
      to: '#000000',
    },
    typography: {
      heading: 'font-bold tracking-wide',
      body: 'font-light',
    },
  },
};

export function getThemeConfig(theme: Theme): ThemeConfig {
  return THEME_CONFIG[theme];
}

export function getThemeStyles(theme: Theme) {
  const config = THEME_CONFIG[theme];
  return {
    container: `bg-gradient-to-b from-[${config.gradient.from}] to-[${config.gradient.to}]`,
    card: `border-2 border-[${config.colors.border}] bg-black/30`,
    heading: `text-[${config.colors.primary}] ${config.typography.heading}`,
    accent: `text-[${config.colors.accent}]`,
    button: `bg-[${config.colors.secondary}] hover:bg-[${config.colors.primary}] text-white`,
  };
}
