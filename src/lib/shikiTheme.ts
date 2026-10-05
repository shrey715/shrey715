// Code-highlighting theme built from the site palette: ink background, paper
// text, the orange accent for keywords and commands, a warm tan for strings,
// and dimmed comments. No colours from outside the brand.
const INK = '#0e0e0e';
const PAPER = '#ede8dc';
const ACCENT = '#ff5a26';
const TAN = '#d9b98c';
const MUTED = '#7f7a70';
const SOFT = '#bdb6a8';

export const inkTheme = {
  name: 'ink',
  type: 'dark' as const,
  colors: {
    'editor.background': INK,
    'editor.foreground': PAPER,
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: MUTED, fontStyle: 'italic' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new', 'support.function.builtin'],
      settings: { foreground: ACCENT },
    },
    { scope: ['entity.name.function', 'support.function', 'entity.name.command'], settings: { foreground: PAPER, fontStyle: 'bold' } },
    { scope: ['string', 'string.quoted', 'string.unquoted.argument'], settings: { foreground: TAN } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: ACCENT } },
    { scope: ['variable', 'variable.other', 'meta.definition.variable'], settings: { foreground: SOFT } },
    { scope: ['variable.parameter', 'variable.other.normal.shell'], settings: { foreground: SOFT } },
    { scope: ['entity.name.tag', 'entity.name.section', 'entity.name.type'], settings: { foreground: ACCENT } },
    { scope: ['entity.other.attribute-name', 'keyword.other.definition.ini'], settings: { foreground: TAN } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: MUTED } },
  ],
};
