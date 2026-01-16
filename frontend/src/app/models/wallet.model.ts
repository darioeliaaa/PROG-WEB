import { User } from './user.model';

/**
 * Interfaccia che definisce la struttura dati di un Wallet (Portafoglio).
 * Viene utilizzata per tipizzare le risposte del backend e gestire la logica nel frontend.
 */
export interface Wallet {
  // Identificativo univoco del wallet nel database
  id: number;

  // Nome assegnato al wallet (es. "Spese Casa", "Risparmi")
  name: string;

  // Flag che indica se il wallet è privato (personale) o condiviso con altri utenti
  personal: boolean;

  // Riferimento all'utente che possiede i diritti di amministrazione sul wallet
  admin: User;

  // Budget mensile prefissato. Se null, non sono previsti limiti di spesa totali
  monthlyBudget: number | null;

  // Soglia massima consentita per una singola transazione in uscita
  maxTransferLimit: number | null;

  // Stato del wallet: se false, le transazioni potrebbero essere bloccate o il wallet nascosto
  active: boolean;

  // Lista degli utenti che partecipano al wallet (inclusi i membri invitati)
  members: User[];

  // Codice alfanumerico univoco utilizzato per invitare nuovi membri nel wallet condiviso
  inviteCode?: string;
}
