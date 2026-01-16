/**
 * Interfaccia che definisce la struttura di un movimento finanziario (Transazione).
 * Segue rigorosamente le convenzioni di nomenclatura del backend Spring Boot.
 */
export interface Transaction {
  // Identificativo univoco della transazione assegnato dal database
  id?: number;

  // Categoria della spesa o dell'entrata (es. 'Alimentari', 'Stipendio', 'Svago')
  category: string;

  // Nota testuale che descrive il movimento
  // NOTA: Deve corrispondere al campo Java 'description' (NON usare 'descrizione')
  description: string;

  // Valore numerico del movimento
  // NOTA: Deve corrispondere al campo Java 'amount' (NON usare 'importo')
  amount: number;

  // Data dell'operazione, solitamente gestita come stringa in formato ISO (YYYY-MM-DD)
  date: string;

  // Classificazione del movimento tramite union type (Literal Type)
  // NOTA: I valori accettati sono esclusivamente in MAIUSCOLO per matchare l'Enum Java
  type: 'ENTRATA' | 'USCITA';
}
