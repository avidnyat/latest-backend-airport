// Use localStorage implementation for frontend-only app
import { Customer, CustomerFormData } from '@/types/customer';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'airport_lounge_customers';

const getStoredCustomers = (): Customer[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const saveCustomers = (customers: Customer[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

const generateMembershipNumber = (membershipType: string): string => {
  const prefix = membershipType.substring(0, 1).toUpperCase();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomDigits}`;
};

export const getAllCustomers = async (sort = true): Promise<Customer[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const customers = getStoredCustomers();
  
  if (sort) {
    return customers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  return customers;
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const allCustomers = await getAllCustomers();
  
  let filteredCustomers = searchTerm ? 
    allCustomers.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) : 
    allCustomers;
  
  if (membershipFilter !== "all") {
    if (membershipFilter === "expiring") {
      filteredCustomers = filteredCustomers.filter(customer => {
        const expiryDate = new Date(customer.expiryDate);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
      });
    } else {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.membershipType === membershipFilter
      );
    }
  }
  
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validPage = page < 1 ? 1 : page > totalPages && totalPages > 0 ? totalPages : page;
  
  const start = (validPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(start, end);
  
  return {
    customers: paginatedCustomers,
    totalPages,
    totalItems
  };
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const customers = getStoredCustomers();
  return customers.find(customer => customer.id === id);
};

export const getCustomerByMembershipNumber = async (membershipNumber: string): Promise<Customer | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const customers = getStoredCustomers();
  return customers.find(customer => customer.membershipNumber === membershipNumber);
};

export const createCustomer = async (customerData: CustomerFormData): Promise<Customer> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const customers = getStoredCustomers();
  
  const newCustomer: Customer = {
    id: uuidv4(),
    ...customerData,
    membershipNumber: generateMembershipNumber(customerData.membershipType),
    createdAt: new Date().toISOString(),
    visits: customerData.visits || 0
  };
  
  customers.push(newCustomer);
  saveCustomers(customers);
  
  return newCustomer;
};

export const updateCustomer = async (id: string, customerData: CustomerFormData): Promise<Customer> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const customers = getStoredCustomers();
  const index = customers.findIndex(customer => customer.id === id);
  
  if (index === -1) {
    throw new Error('Customer not found');
  }
  
  const updatedCustomer = {
    ...customers[index],
    ...customerData,
  };
  
  customers[index] = updatedCustomer;
  saveCustomers(customers);
  
  return updatedCustomer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let customers = getStoredCustomers();
  customers = customers.filter(customer => customer.id !== id);
  saveCustomers(customers);
};

export const getCustomersStats = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const customers = getStoredCustomers();
  
  return {
    total: customers.length,
    prestige: customers.filter(c => c.membershipType === 'prestige').length,
    premier: customers.filter(c => c.membershipType === 'premier').length,
    expiringSoon: customers.filter(c => {
      const expiryDate = new Date(c.expiryDate);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length
  };
};

export const decrementVisits = async (id: string): Promise<Customer | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const customers = getStoredCustomers();
  const index = customers.findIndex(customer => customer.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  const customer = customers[index];
  
  if (customer.visits > 0) {
    customer.visits -= 1;
    customers[index] = customer;
    saveCustomers(customers);
  }
  
  return customer;
};

export const getQRCodeValue = async (id: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const customer = await getCustomerById(id);
  if (!customer) {
    console.error("Could not generate QR code: Customer not found");
    return `/verify?error=customer_not_found`;
  }
  
  return `/verify?membershipNumber=${customer.membershipNumber}`;
};