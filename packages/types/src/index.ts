// TropiGo Shared Types
//
// Database types (User, Experience, etc.) are now inferred from Drizzle schema.
// Import them from: apps/api/src/db/schema
//
// This file is for non-database types like API responses, UI state, etc.

// ============= API Response Wrapper =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============= Add other shared types here =============
// Examples:
// - UI-specific types (filters, form state, etc.)
// - Utility types (Paginated, etc.)
// - Frontend-only interfaces
