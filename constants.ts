
import { BusinessConfig } from './types';

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const INITIAL_BUSINESS_CONFIG: BusinessConfig = {
  id: 'mock-biz-1',
  name: 'Luxe Hair & Spa',
  whatsappNumber: '60125976284',
  primaryColor: '#6366f1', // Indigo 500
  logoUrl: 'https://picsum.photos/seed/spa/200/200',
  tagline: 'Expert grooming for the modern professional.',
  services: [
    { id: '1', name: 'Executive Haircut', duration: 45, price: '45.00', description: 'Precision cut, wash, and styling.' },
    { id: '2', name: 'Beard Grooming', duration: 30, price: '25.00', description: 'Trimming, shaping, and conditioning.' },
    { id: '3', name: 'Classic Shave', duration: 40, price: '35.00', description: 'Traditional hot towel straight razor shave.' },
  ],
  availability: DAYS_OF_WEEK.map(day => ({
    day,
    isOpen: !['Saturday', 'Sunday'].includes(day),
    startTime: '09:00',
    endTime: '18:00'
  }))
};
