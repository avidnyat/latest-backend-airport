
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerFormData } from '@/types/customer';

export const getAllCustomers = async (sort = true): Promise<Customer[]> => {
  let query = supabase
    .from('customers')
    .select('*');
  
  if (sort) {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
  
  return data.map(customer => ({
    id: customer.id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.phone || undefined,
    membershipType: customer.membership_type as 'prestige' | 'premier',
    membershipNumber: customer.membership_number,
    expiryDate: customer.expiry_date,
    createdAt: customer.created_at,
    visits: customer.visits || 0,
  }));
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
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' });

  // Apply search filtering
  if (searchTerm) {
    query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,membership_number.ilike.%${searchTerm}%`);
  }

  // Apply membership type filtering
  if (membershipFilter !== "all") {
    if (membershipFilter === "expiring") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysDate = thirtyDaysFromNow.toISOString().split('T')[0];
      
      query = query.gte('expiry_date', today).lte('expiry_date', thirtyDaysDate);
    } else {
      query = query.eq('membership_type', membershipFilter);
    }
  }

  // Get total count
  const { count } = await query;
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Apply pagination
  const start = (page - 1) * itemsPerPage;
  query = query
    .order('created_at', { ascending: false })
    .range(start, start + itemsPerPage - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching paginated customers:', error);
    throw error;
  }

  const customers = data.map(customer => ({
    id: customer.id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.phone || undefined,
    membershipType: customer.membership_type as 'prestige' | 'premier',
    membershipNumber: customer.membership_number,
    expiryDate: customer.expiry_date,
    createdAt: customer.created_at,
    visits: customer.visits || 0,
  }));

  return {
    customers,
    totalPages,
    totalItems
  };
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone || undefined,
    membershipType: data.membership_type as 'prestige' | 'premier',
    membershipNumber: data.membership_number,
    expiryDate: data.expiry_date,
    createdAt: data.created_at,
    visits: data.visits || 0,
  };
};

export const getCustomerByMembershipNumber = async (membershipNumber: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('membership_number', membershipNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching customer by membership number:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone || undefined,
    membershipType: data.membership_type as 'prestige' | 'premier',
    membershipNumber: data.membership_number,
    expiryDate: data.expiry_date,
    createdAt: data.created_at,
    visits: data.visits || 0,
  };
};

const generateMembershipNumber = (membershipType: string): string => {
  const prefix = membershipType.substring(0, 1).toUpperCase();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomDigits}`;
};

export const createCustomer = async (customerData: CustomerFormData): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      membership_type: customerData.membershipType,
      membership_number: generateMembershipNumber(customerData.membershipType),
      expiry_date: customerData.expiryDate,
      visits: customerData.visits || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone || undefined,
    membershipType: data.membership_type as 'prestige' | 'premier',
    membershipNumber: data.membership_number,
    expiryDate: data.expiry_date,
    createdAt: data.created_at,
    visits: data.visits || 0,
  };
};

export const updateCustomer = async (id: string, customerData: CustomerFormData): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update({
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      membership_type: customerData.membershipType,
      expiry_date: customerData.expiryDate,
      visits: customerData.visits || 0,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone || undefined,
    membershipType: data.membership_type as 'prestige' | 'premier',
    membershipNumber: data.membership_number,
    expiryDate: data.expiry_date,
    createdAt: data.created_at,
    visits: data.visits || 0,
  };
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

export const getCustomersStats = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('membership_type, expiry_date');

  if (error) {
    console.error('Error fetching customer stats:', error);
    throw error;
  }

  const stats = {
    total: data.length,
    prestige: data.filter(c => c.membership_type === 'prestige').length,
    premier: data.filter(c => c.membership_type === 'premier').length,
    expiringSoon: data.filter(c => {
      const expiryDate = new Date(c.expiry_date);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length
  };

  return stats;
};

export const decrementVisits = async (id: string): Promise<Customer | null> => {
  const customer = await getCustomerById(id);
  if (!customer || customer.visits <= 0) {
    return customer;
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ visits: customer.visits - 1 })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error decrementing visits:', error);
    throw error;
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone || undefined,
    membershipType: data.membership_type as 'prestige' | 'premier',
    membershipNumber: data.membership_number,
    expiryDate: data.expiry_date,
    createdAt: data.created_at,
    visits: data.visits || 0,
  };
};

export const getQRCodeValue = (id: string): string => {
  return `/verify?customerId=${id}`;
};
