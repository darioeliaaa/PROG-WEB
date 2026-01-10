import { User } from './user.model';

export interface Wallet {
  id: number;

  name: string;

  // true se è il wallet personale creato alla registrazione
  personal: boolean;

  // admin del wallet
  admin: User;

  // budget mensile (può essere null)
  monthlyBudget: number | null;

  // stato del wallet
  active: boolean;

  // membri del wallet
  members: User[];
}
