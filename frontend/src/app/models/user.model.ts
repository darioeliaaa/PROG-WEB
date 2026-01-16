/**
 * Rappresenta l'entità Utente all'interno dell'applicazione.
 * Viene utilizzata sia per l'utente loggato che per i membri dei wallet condivisi.
 */
export class User {
  // Identificativo univoco dell'utente.
  // Il punto di domanda (?) indica che il campo è opzionale (es. durante la creazione di un nuovo utente l'ID non è ancora assegnato).
  id?: number;

  // Nome utente univoco utilizzato per il login o per essere cercato durante gli inviti nei wallet.
  username?: string;
}
