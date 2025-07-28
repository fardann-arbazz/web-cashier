import { User, Shield, UserCog, Loader2, Key, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import API from "@/lib/axios";
import { toast } from "sonner";

interface UpdateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
    email?: string;
    password?: string;
    role: string;
  } | null;
  onSuccess?: () => void;
}

const roleOptions = [
  { value: "admin", label: "Admin", icon: <Shield className="w-4 h-4 mr-2" /> },
  {
    value: "kasir",
    label: "Kasir",
    icon: <UserCog className="w-4 h-4 mr-2" />,
  },
];

export const UpdateUserModal = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UpdateUserModalProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        role: user.role,
        password: user.password || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      // Replace with your actual API call
      await API.put(`/users/${user.id}/update`, formData, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      toast.success("Update users successfully!");

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Update users failed!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Update User
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* User Avatar Preview */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                {formData.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1 rounded-full border shadow-sm">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="pl-9"
                required
              />
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={handleRoleChange}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Update a strong password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="gap-2">
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
