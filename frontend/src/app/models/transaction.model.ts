export interface Transaction {
  id?: number;          // Prima era: id (number)
  description: string;  // Prima era: descrizione
  amount: number;       // Prima era: importo
  date: string;         // Prima era: data
  type: 'INCOME' | 'EXPENSE'; // Prima era: tipo ('entrata' | 'uscita')
  // categoria: string; // Se il backend non ce l'ha ancora, commentala o gestiscila dopo
}
