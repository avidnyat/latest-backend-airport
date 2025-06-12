
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerFormData } from "@/types/customer";
import { createCustomer, getCustomerById, updateCustomer } from "@/services/customerService";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  membershipType: z.enum(["prestige", "premier"], {
    required_error: "Please select a membership type",
  }),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
  visits: z.number().int().min(0, "Visits must be a positive number"),
});

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      membershipType: "prestige" as const,
      expiryDate: new Date(),
      visits: 0,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      const loadCustomer = async () => {
        try {
          const customer = await getCustomerById(id);
          if (customer) {
            // Parse the expiry date more safely
            let expiryDate: Date;
            try {
              // Try parsing the date string directly first
              expiryDate = new Date(customer.expiryDate);
              
              // If that results in an invalid date, try alternative parsing
              if (isNaN(expiryDate.getTime())) {
                // Split the date string and create date with explicit components
                const dateParts = customer.expiryDate.split('-');
                if (dateParts.length === 3) {
                  expiryDate = new Date(
                    parseInt(dateParts[0]), // year
                    parseInt(dateParts[1]) - 1, // month (0-indexed)
                    parseInt(dateParts[2]) // day
                  );
                } else {
                  throw new Error('Invalid date format');
                }
              }
              
              // Final check to ensure we have a valid date
              if (isNaN(expiryDate.getTime())) {
                throw new Error('Unable to parse date');
              }
            } catch (dateError) {
              console.error('Error parsing expiry date:', dateError, 'Raw date:', customer.expiryDate);
              // Fall back to current date if parsing fails
              expiryDate = new Date();
              toast.error("Could not parse the expiry date, using current date as fallback");
            }
            
            form.reset({
              firstName: customer.firstName,
              lastName: customer.lastName,
              email: customer.email,
              phone: customer.phone || "",
              membershipType: customer.membershipType,
              expiryDate: expiryDate,
              visits: customer.visits,
            });
          } else {
            toast.error("Customer not found");
            navigate("/customers");
          }
        } catch (error) {
          console.error('Error loading customer:', error);
          toast.error("Failed to load customer");
          navigate("/customers");
        } finally {
          setInitialLoading(false);
        }
      };

      loadCustomer();
    }
  }, [id, isEditMode, form, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Format date as YYYY-MM-DD to avoid timezone issues
      const formattedDate = format(values.expiryDate, 'yyyy-MM-dd');
      
      const customerData: CustomerFormData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        membershipType: values.membershipType,
        expiryDate: formattedDate,
        visits: values.visits,
      };

      if (isEditMode && id) {
        await updateCustomer(id, customerData);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(customerData);
        toast.success("Customer created successfully");
      }
      navigate("/customers");
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error("Failed to save customer");
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {isEditMode ? "Edit Customer" : "Add New Customer"}
        </h1>
        <p className="text-gray-500">
          {isEditMode
            ? "Update customer information"
            : "Enter details to add a new premium member"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required-field">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required-field">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required-field">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="membershipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required-field">Membership Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select membership type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prestige">Prestige</SelectItem>
                        <SelectItem value="premier">Premier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="required-field">Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="visits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required-field">Number of Visits</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="1"
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customers")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : isEditMode ? "Update Customer" : "Add Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default CustomerForm;
