import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, User, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorMessage } from "@/components/ui/error-message";

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "kasir",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    role: "",
    password: "",
  });

  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "kasir", label: "Kasir" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate password requirements
    if (!validatePassword(formData.password)) {
      toast.error("Password doesn't meet requirements");
      setLoading(false);
      return;
    }

    // Post to API
    try {
      await API.post(
        "/users",
        {
          username: formData.name,
          role: formData.role,
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      toast.success("User created successfully!");
      setFormData({
        name: "",
        role: "kasir",
        password: "",
      });
      setTimeout(() => navigate("/dashboard/users"), 800);
    } catch (error: any) {
      if (error.response?.data?.error) {
        const apiErrors = error.response.data.error;

        const newErrors = {
          name: apiErrors.username?.[0]?.message || "",
          role: apiErrors.role?.[0]?.message || "",
          password: apiErrors.password?.[0]?.message || "",
        };

        setErrors(newErrors);

        // Show general error toast
        toast.error("Please fix the validation errors");
      } else {
        toast.error("Failed to create product!");
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to={"/dashboard/users"}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-primary" />
            Create New User
          </h1>
          <p className="text-muted-foreground">
            Add a new user to your organization
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              className={errors.name ? "border-red-500" : ""}
            />
            <ErrorMessage message={errors.name} />
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              User Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          role.value === "admin"
                            ? "bg-purple-500"
                            : role.value === "manager"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              <p>Permissions:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {formData.role === "admin" && (
                  <>
                    <li>Akses sistem penuhs</li>
                    <li>Dapat mengelola semua pengguna dan pengaturan</li>
                  </>
                )}
                {formData.role === "kasir" && (
                  <>
                    <li>Dapat mengelola transaksi dan stok barang</li>
                    <li>Tidak bisa mendapatkan akses penuh</li>
                  </>
                )}
              </ul>
            </div>

            <ErrorMessage message={errors.role} />
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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
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
            <div className="text-sm text-muted-foreground">
              <p>Password requirements:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li
                  className={
                    formData.password.length >= 8 ? "text-green-500" : ""
                  }
                >
                  Minimal 6 karakter
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.password) ? "text-green-500" : ""
                  }
                >
                  Minimal satu huruf kapital
                </li>
                <li
                  className={
                    /[0-9]/.test(formData.password) ? "text-green-500" : ""
                  }
                >
                  Minimal satu angka
                </li>
                <li
                  className={
                    /[^A-Za-z0-9]/.test(formData.password)
                      ? "text-green-500"
                      : ""
                  }
                >
                  Minimal satu karakter khusus
                </li>
              </ul>
            </div>

            <ErrorMessage message={errors.password} />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !validatePassword(formData.password)}
              className="cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
