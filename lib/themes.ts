// =============================================================================
// Theme System
// =============================================================================
// Each theme is a self-contained color palette. Swap via NEXT_PUBLIC_THEME env var.
// All components use CSS variables — zero hardcoded colors anywhere.
// =============================================================================

export interface Theme {
  name: string;
  background: string;
  surface: string;
  primary: string;
  accent: string;
  soft: string;
  pop: string;
  bokeh: string[];
  grain: boolean;
}

export const themes: Record<string, Theme> = {
  // -------------------------------------------------------------------------
  // Midnight — dark, warm, cinematic. Great for evening events and galas.
  // -------------------------------------------------------------------------
  midnight: {
    name: 'Midnight',
    background: '#1C0F0A',
    surface: '#2A1810',
    primary: '#E8913A',
    accent: '#F5D87A',
    soft: '#F5E6D3',
    pop: '#C0392B',
    bokeh: ['#E8913A', '#F5D87A', '#C0392B'],
    grain: true,
  },

  // -------------------------------------------------------------------------
  // Golden — rich amber and cream. Celebrations, milestones, warm gatherings.
  // -------------------------------------------------------------------------
  golden: {
    name: 'Golden',
    background: '#141200',
    surface: '#201C00',
    primary: '#F5C518',
    accent: '#E8891A',
    soft: '#FDF6E3',
    pop: '#4CAF50',
    bokeh: ['#F5C518', '#E8891A', '#4CAF50'],
    grain: true,
  },

  // -------------------------------------------------------------------------
  // Garden — deep violet with warm accents. Evening parties, creative events.
  // -------------------------------------------------------------------------
  garden: {
    name: 'Garden',
    background: '#080612',
    surface: '#110D1F',
    primary: '#C084FC',
    accent: '#F1C40F',
    soft: '#FAF0FF',
    pop: '#E91E8C',
    bokeh: ['#C084FC', '#F1C40F', '#E91E8C'],
    grain: true,
  },

  // -------------------------------------------------------------------------
  // Minimal — light, clean, modern. Corporate events, daytime gatherings.
  // -------------------------------------------------------------------------
  minimal: {
    name: 'Minimal',
    background: '#F5EDE0',
    surface: '#FAF7F2',
    primary: '#8B4513',
    accent: '#D4AF37',
    soft: '#3D1C0A',
    pop: '#C0392B',
    bokeh: ['#8B4513', '#D4AF37', '#C0392B'],
    grain: false,
  },
};

export type ThemeKey = keyof typeof themes;
export const defaultTheme: ThemeKey = 'midnight';

export function getTheme(key?: string): Theme {
  if (key && key in themes) return themes[key as ThemeKey];
  return themes[defaultTheme];
}
