
export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: string;
  description?: string;
}

export interface DayAvailability {
  day: string; // "Monday", "Tuesday", etc.
  isOpen: boolean;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface BusinessConfig {
  id: string;
  name: string;
  whatsappNumber: string;
  primaryColor: string;
  logoUrl?: string;
  tagline: string;
  services: Service[];
  availability: DayAvailability[];
}

export type ViewState = 'CUSTOMER_VIEW' | 'BUSINESS_DASHBOARD';
