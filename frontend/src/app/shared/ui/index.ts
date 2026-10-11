// Componenti grafici condivisi: importa UI negli `imports` dei componenti.
import { Guilloche, Microtext, Rosette } from './guilloche';
import { CategoryIcon, Icon } from './icons';

export { Guilloche, Microtext, Rosette, CategoryIcon, Icon };
export { categoria, coloreCategoria, CATEGORIE } from './icons';

export const UI = [Rosette, Guilloche, Microtext, Icon, CategoryIcon] as const;
