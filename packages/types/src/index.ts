// TropiGo Shared Types

// ============= API Response Wrapper =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============= Database Types =============
// These types should match the Drizzle schema in apps/api/src/db/schema.ts

export interface Experience {
  id: string;
  hostId: string;
  title: string;
  description: string;
  category: 'island' | 'diving' | 'boat-trip' | 'culture' | 'water-sport';
  price: string; // decimal as string
  island: string;
  images: string[];
  rating?: string | null;
  reviewCount?: string | null;
  duration?: string | null;
  maxGroupSize?: string | null;
  hostType?: string | null; // 'local' | 'freelance' | 'company'
  whatsIncluded?: string[] | null;
  createdAt: Date | string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tourist' | 'host' | 'admin';
  createdAt: Date | string;
}

export interface Booking {
  id: string;
  userId: string;
  experienceId: string;
  bookingDate: Date | string;
  numberOfGuests: string;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date | string;
}

export interface Review {
  id: string;
  userId: string;
  experienceId: string;
  rating: string;
  comment: string;
  createdAt: Date | string;
  userName?: string;
}

export interface Landmark {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  defaultLanguage: string;
  isFeatured?: boolean | null;
  description?: string | null;
  distanceKm?: number | null;
  createdAt?: Date | string;
}

export interface LandmarkTranslation {
  id: string;
  landmarkId: string;
  language: string;
  name: string;
  description: string;
}

export interface LandmarkWithTranslation extends Landmark {
  language: string;
  description: string;
}

// ============= UI Types =============
export type CategoryFilter = 'all' | 'island' | 'diving' | 'boat-trip' | 'culture' | 'water-sport';
