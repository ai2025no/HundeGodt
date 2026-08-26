import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminRole, AdminUser } from '@/types';
import { db } from '@/lib/db';

interface AdminState {
  currentRole: AdminRole;
  currentUser: AdminUser;
  isCommandOpen: boolean;
  setRole: (role: AdminRole) => void;
  openCommand: () => void;
  closeCommand: () => void;
  toggleCommand: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      currentRole: 'owner',
      currentUser: {
        id: 'adm-1',
        name: 'Kari Hundegodt (Eier)',
        email: 'kari@hundegodt.no',
        role: 'owner',
        lastLoginAt: new Date().toISOString(),
      },
      isCommandOpen: false,

      setRole: (role: AdminRole) => {
        db.setCurrentAdminRole(role);
        const nameMap: Record<AdminRole, string> = {
          owner: 'Kari Hundegodt (Eier)',
          administrator: 'Ola Daglig Leder',
          warehouse: 'Lars Lageransvarlig',
          support: 'Silje Kundeservice',
          marketing: 'Mona Markedsfører',
          analyst: 'Per Dataanalytiker',
        };
        set({
          currentRole: role,
          currentUser: {
            id: `adm-${role}`,
            name: nameMap[role] || 'Admin Bruker',
            email: `${role}@hundegodt.no`,
            role,
            lastLoginAt: new Date().toISOString(),
          },
        });
      },

      openCommand: () => set({ isCommandOpen: true }),
      closeCommand: () => set({ isCommandOpen: false }),
      toggleCommand: () => set((state) => ({ isCommandOpen: !state.isCommandOpen })),
    }),
    {
      name: 'hg_admin_session_storage',
    }
  )
);
