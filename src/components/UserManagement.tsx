import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, updateUser, deleteUser, signUp, User } from "@/services/authService";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Use the User interface directly from authService since it now includes created_at
type StaffUser = User;

const UserManagement = () => {
  const { isAdmin, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Only allow admin users to access this component
  if (!isAdmin()) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 font-semibold">Access Denied: Admin privileges required</p>
      </div>
    );
  }

  const fetchStaffUsers = async () => {
    console.log('Fetching staff users...');
    setFetchLoading(true);
    try {
      const users = await getAllUsers();
      console.log('Users fetched:', users.length || 0);
      setStaffUsers(users || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users: " + error.message);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    console.log('Creating user:', { email, fullName, role });

    try {
      await signUp(email, password, fullName, role);
      console.log('User creation process completed successfully');
      toast.success(`${role === 'admin' ? 'Admin' : 'Staff'} account created successfully!`);

      // Reset form and close dialog
      setIsCreateDialogOpen(false);
      const form = e.currentTarget;
      form.reset();
      
      // Refresh the user list
      await fetchStaffUsers();

    } catch (error: any) {
      console.error('Unexpected error during user creation:', error);
      toast.error('Failed to create user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    try {
      console.log('Updating user:', editingUser.id, { fullName, role });
      
      await updateUser(editingUser.id, { fullName, role });

      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      await fetchStaffUsers();
      await refreshUser(); // Refresh current user in case they updated themselves
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user: " + error.message);
    }
    
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting user:', userId);
      
      await deleteUser(userId);

      toast.success("User deleted successfully");
      await fetchStaffUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">User Management</h2>
          <p className="text-gray-600">Manage staff and admin users (Admin Only)</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new staff or admin account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="createFullName">Full Name</Label>
                <Input
                  id="createFullName"
                  name="fullName"
                  type="text"
                  placeholder="User Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createEmail">Email</Label>
                <Input
                  id="createEmail"
                  name="email"
                  type="email"
                  placeholder="user@fcb.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createPassword">Password</Label>
                <Input
                  id="createPassword"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createRole">Role</Label>
                <select
                  id="createRole"
                  name="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Creating..." : "Create User"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            View and manage all staff and admin users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Staff'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) setEditingUser(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                  Update user information
                                </DialogDescription>
                              </DialogHeader>
                              {editingUser && (
                                <form onSubmit={handleUpdateUser} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="editFullName">Full Name</Label>
                                    <Input
                                      id="editFullName"
                                      name="fullName"
                                      type="text"
                                      defaultValue={editingUser.full_name}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="editEmail">Email (Read Only)</Label>
                                    <Input
                                      id="editEmail"
                                      type="email"
                                      value={editingUser.email}
                                      disabled
                                      className="bg-gray-100"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="editRole">Role</Label>
                                    <select
                                      id="editRole"
                                      name="role"
                                      defaultValue={editingUser.role}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                      required
                                    >
                                      <option value="staff">Staff</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="submit" className="flex-1" disabled={loading}>
                                      {loading ? "Updating..." : "Update User"}
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setEditingUser(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {staffUsers.length === 0 && !fetchLoading && (
                <div className="text-center py-8 text-gray-500">
                  No users found. Create your first user to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
