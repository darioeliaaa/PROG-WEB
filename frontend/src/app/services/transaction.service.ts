import { Injectable } from '@angular/core';

export interface Transaction {
  id: number;
  tipo: 'entrata' | 'uscita';
  importo: number;
  descrizione: string;
  categoria: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private key = 'money_mind_db';

  constructor() {}

  private load(): Transaction[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  add(t: Omit<Transaction, 'id'>) {
    const transactions = this.load();
    const newTransaction: Transaction = {
      ...t,
      id: Date.now(),
      importo: Number(t.importo)
    };
    transactions.push(newTransaction);
    localStorage.setItem(this.key, JSON.stringify(transactions));
  }

  getDataByMonth(meseIdx: number, anno: number) {
    const all = this.load();
    const filtered = all.filter(t => {
      const parts = t.data.split('-');
      const tAnno = Number(parts[0]);
      const tMese = Number(parts[1]) - 1;
      return tAnno === anno && tMese === meseIdx;
    });

    const totaleEntrate = filtered
      .filter(t => t.tipo === 'entrata').reduce((acc, curr) => acc + curr.importo, 0);
    const totaleUscite = filtered
      .filter(t => t.tipo === 'uscita').reduce((acc, curr) => acc + curr.importo, 0);

    return { transactions: filtered, totaleEntrate, totaleUscite, saldo: totaleEntrate - totaleUscite };
  }

  getDataByYear(anno: number): Transaction[] {
    const all = this.load();
    return all.filter(t => Number(t.data.split('-')[0]) === anno);
  }
  getAllTransactions(): Transaction[] {
    return this.load();
  }
}
