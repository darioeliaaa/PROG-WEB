import { User } from './user.model';

export interface Wallet {
  id: number;
  name: string;
  personal: boolean;
  admin: User;
  monthlyBudget: number | null;
  maxTransferLimit: number | null;
  active: boolean;
  members: User[];

  // ✅ NUOVO CAMPO
  inviteCode?: string;
}
