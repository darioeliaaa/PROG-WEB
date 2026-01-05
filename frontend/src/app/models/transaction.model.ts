export interface Transaction {
  id?: number;
  description: string;  // NON descrizione
  amount: number;       // NON importo
  date: string;
  type: 'INCOME' | 'EXPENSE'; // NON 'entrata' | 'uscita'
}
