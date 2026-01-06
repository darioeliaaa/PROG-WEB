export interface Transaction {
  id?: number;
  category: string;
  description: string;  // NON descrizione
  amount: number;       // NON importo
  date: string;
  type: 'ENTRATA' | 'USCITA'; // NON 'entrata' | 'uscita'
}
