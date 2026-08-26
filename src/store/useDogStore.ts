import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DogProfile, Product } from '@/types';
import { db } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

interface DogState {
  activeDog: DogProfile | null;
  dogs: DogProfile[];
  setActiveDog: (dog: DogProfile | null) => void;
  loadDogsForCustomer: (customerId?: string) => void;
  addDog: (dog: Omit<DogProfile, 'id' | 'createdAt'>) => DogProfile;
  removeDog: (dogId: string) => void;
  updateDog: (dogId: string, updates: Partial<DogProfile>) => void;
  hasAllergyWarning: (product: Product | { allergens?: string[]; ingredients?: string }) => boolean;
}

export const useDogStore = create<DogState>()(
  persist(
    (set, get) => ({
      activeDog: null,
      dogs: [],

      setActiveDog: (dog) => {
        set({ activeDog: dog });
        if (dog) {
          trackEvent('dog_filter_applied', {
            dogId: dog.id,
            dogBreed: dog.breed,
            lifeStage: dog.lifeStage,
            allergies: dog.allergies,
          });
        }
      },

      loadDogsForCustomer: (customerId) => {
        const customer = customerId ? db.getCustomers().find(c => c.id === customerId) : db.getCurrentCustomer();
        const loadedDogs = customer?.dogs || [];
        set({ dogs: loadedDogs });
        if (!get().activeDog && loadedDogs.length > 0) {
          set({ activeDog: loadedDogs[0] });
        }
      },

      addDog: (dogData) => {
        const currentCustomer = db.getCurrentCustomer();
        const newDog = db.addDogToCustomer(currentCustomer.id, dogData);
        get().loadDogsForCustomer(currentCustomer.id);
        set({ activeDog: newDog });
        return newDog;
      },

      removeDog: (dogId) => {
        const currentCustomer = db.getCurrentCustomer();
        db.deleteDog(currentCustomer.id, dogId);
        get().loadDogsForCustomer(currentCustomer.id);
        if (get().activeDog?.id === dogId) {
          const remaining = get().dogs.filter((d) => d.id !== dogId);
          set({ activeDog: remaining[0] || null });
        }
      },

      updateDog: (dogId, updates) => {
        const currentCustomer = db.getCurrentCustomer();
        db.updateDog(currentCustomer.id, dogId, updates);
        get().loadDogsForCustomer(currentCustomer.id);
        if (get().activeDog?.id === dogId) {
          set({ activeDog: { ...get().activeDog, ...updates } as DogProfile });
        }
      },

      hasAllergyWarning: (product) => {
        const dog = get().activeDog;
        if (!dog || !dog.allergies || dog.allergies.length === 0) return false;

        const allergens = product.allergens || [];
        const ingredientsText = (product.ingredients || '').toLowerCase();

        return dog.allergies.some((allergy) => {
          const a = allergy.toLowerCase();
          return allergens.some((alg) => alg.toLowerCase().includes(a)) || ingredientsText.includes(a);
        });
      },
    }),
    {
      name: 'hg_active_dog_storage',
    }
  )
);
