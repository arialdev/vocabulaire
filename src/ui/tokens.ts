/** Field Notebook design tokens. Functional outlines identify controls; dividers are decorative. */
export const lightTheme = {
  mode: 'light',
  canvas: '#F8F5EE',
  surface: '#FFFCF6',
  input: '#F0EDE5',
  text: '#20382E',
  secondaryText: '#59675E',
  divider: '#D8DED2',
  controlOutline: '#7E9180',
  primary: '#2D6046',
  onPrimary: '#FFFFFF',
  selected: '#E2ECDF',
  grammaticalText: '#684435',
  grammaticalFill: '#F1E5DC',
  thematicText: '#345B43',
  thematicFill: '#E2ECDF',
  destructive: '#A53532',
  errorSurface: '#FBE6E1',
} as const;

export type Theme = {
  [K in keyof typeof lightTheme]: K extends 'mode' ? 'light' | 'dark' : string;
};
export const darkTheme: Theme = {
  mode: 'dark',
  canvas: '#171E1B',
  surface: '#222D27',
  input: '#1C2520',
  text: '#F3F0E7',
  secondaryText: '#B8C6BC',
  divider: '#45574A',
  controlOutline: '#7D9383',
  primary: '#B9D8BB',
  onPrimary: '#173824',
  selected: '#344D3A',
  grammaticalText: '#F3C3AA',
  grammaticalFill: '#49362D',
  thematicText: '#C1DFC4',
  thematicFill: '#344D3A',
  destructive: '#FFB4AB',
  errorSurface: '#4A2926',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radii = { control: 12, sheet: 24 } as const;
export const typography = {
  display: { fontSize: 36, lineHeight: 40 },
  pageTitle: { fontSize: 30, lineHeight: 36 },
  headword: { fontSize: 24, lineHeight: 30 },
  section: { fontSize: 20, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 24 },
  secondary: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 12, lineHeight: 16 },
} as const;
