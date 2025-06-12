
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: 'prestige' | 'premier';
  membershipNumber: string;
  expiryDate: string; // ISO Date string
  createdAt: string; // ISO Date string
  visits: number;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: 'prestige' | 'premier';
  expiryDate: string;
  visits: number;
}
