
import { getAllCustomers as getLocalStorageCustomers, createCustomer } from '@/services/customerService';
import { createCustomer as createSupabaseCustomer } from '@/services/supabaseCustomerService';
import { Customer, CustomerFormData } from '@/types/customer';
import { toast } from "sonner";

export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  try {
    // Get all customers from localStorage
    const localCustomers = await getLocalStorageCustomers(false);
    
    if (localCustomers.length === 0) {
      toast.info("No local data found to migrate");
      return;
    }

    toast.info(`Found ${localCustomers.length} customers to migrate...`);

    let successCount = 0;
    let errorCount = 0;

    for (const customer of localCustomers) {
      try {
        const customerData: CustomerFormData = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          membershipType: customer.membershipType,
          expiryDate: customer.expiryDate,
          visits: customer.visits,
        };

        await createSupabaseCustomer(customerData);
        successCount++;
      } catch (error) {
        console.error(`Failed to migrate customer ${customer.email}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully migrated ${successCount} customers to database`);
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to migrate ${errorCount} customers`);
    }

    // Clear localStorage after successful migration
    if (successCount > 0 && errorCount === 0) {
      localStorage.removeItem('airport_lounge_customers');
      toast.info("Local storage cleared after successful migration");
    }

  } catch (error) {
    console.error('Migration error:', error);
    toast.error("Failed to migrate data to database");
  }
};
