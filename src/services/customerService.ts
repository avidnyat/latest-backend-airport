
import { Customer, CustomerFormData } from '@/types/customer';

// Configure API base URL - can be set via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Call: ${options.method || 'GET'} ${url}`);
  
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  return handleResponse(response);
};

export const getAllCustomers = async (sort = true): Promise<Customer[]> => {
  console.log('Fetching all customers from API');
  const queryParam = sort ? '?sort=true' : '?sort=false';
  return apiCall(`/customers${queryParam}`);
};

export const getCustomersPaginated = async (
  page: number, 
  itemsPerPage: number, 
  searchTerm = "", 
  membershipFilter = "all"
): Promise<{ 
  customers: Customer[]; 
  totalPages: number;
  totalItems: number;
}> => {
  console.log('Fetching paginated customers from API');
  const params = new URLSearchParams({
    page: page.toString(),
    itemsPerPage: itemsPerPage.toString(),
    searchTerm,
    membershipFilter
  });
  
  return apiCall(`/customers/paginated?${params}`);
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  console.log(`Fetching customer by ID: ${id}`);
  try {
    return await apiCall(`/customers/${id}`);
  } catch (error: any) {
    if (error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const getCustomerByMembershipNumber = async (membershipNumber: string): Promise<Customer | undefined> => {
  console.log(`Fetching customer by membership number: ${membershipNumber}`);
  try {
    return await apiCall(`/customers/membership/${membershipNumber}`);
  } catch (error: any) {
    if (error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const createCustomer = async (customerData: CustomerFormData): Promise<Customer> => {
  console.log('Creating new customer via API');
  return apiCall('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
};

export const updateCustomer = async (id: string, customerData: CustomerFormData): Promise<Customer> => {
  console.log(`Updating customer: ${id}`);
  return apiCall(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  });
};

export const deleteCustomer = async (id: string): Promise<void> => {
  console.log(`Deleting customer: ${id}`);
  await apiCall(`/customers/${id}`, {
    method: 'DELETE',
  });
};

export const getCustomersStats = async () => {
  console.log('Fetching customer statistics from API');
  return apiCall('/customers/stats');
};

export const decrementVisits = async (id: string): Promise<Customer | undefined> => {
  console.log(`Decrementing visits for customer: ${id}`);
  try {
    return await apiCall(`/customers/${id}/decrement-visits`, {
      method: 'PATCH',
    });
  } catch (error: any) {
    if (error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
};

export const getQRCodeValue = async (id: string): Promise<string> => {
  console.log(`Fetching QR code value for customer: ${id}`);
  const response = await apiCall(`/customers/${id}/qr`);
  return response.qrValue;
};
