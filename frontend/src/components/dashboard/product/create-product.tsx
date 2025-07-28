import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Box, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCategories } from "@/service/api/category-service";
import type { Category } from "@/types/category-type";
import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorMessage } from "@/components/ui/error-message";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    stok: "",
    category_id: "",
  });

  const [errors, setErrors] = useState({
    nama: "",
    harga: "",
    stok: "",
    category_id: "",
  });

  // fetching data category from server
  const fetchCategory = async () => {
    try {
      const res = await fetchCategories();

      setCategory(res.data);
    } catch (error) {
      console.log("error data", error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      nama: "",
      harga: "",
      stok: "",
      category_id: "",
    };

    if (!formData.nama.trim()) {
      newErrors.nama = "Product name is required";
      isValid = false;
    } else if (formData.nama.length > 100) {
      newErrors.nama = "Product name must be less than 100 characters";
      isValid = false;
    }

    if (!formData.harga) {
      newErrors.harga = "Price is required";
      isValid = false;
    } else if (Number(formData.harga.replace(/\D/g, "")) < 1000) {
      newErrors.harga = "Minimum price is 1000";
      isValid = false;
    }

    if (!formData.stok) {
      newErrors.stok = "Stock is required";
      isValid = false;
    } else if (Number(formData.stok) < 0) {
      newErrors.stok = "Stock cannot be negative";
      isValid = false;
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API call to post
      await API.post(
        "/barang",
        {
          nama: formData.nama,
          harga: parseInt(formData.harga.replace(/\D/g, ""), 10), // menghapus Rp, titik, dll
          stok: parseInt(formData.stok, 10),
          category_id: parseInt(formData.category_id, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      toast.success("Product created successfully!");
      navigate("/dashboard/products");
    } catch (error: any) {
      if (error.response?.data?.error) {
        const apiErrors = error.response.data.error;
        const newErrors = {
          nama: apiErrors.nama?.[0]?.message || "",
          harga: apiErrors.harga?.[0]?.message || "",
          stok: apiErrors.stok?.[0]?.message || "",
          category_id: apiErrors.category_id?.[0]?.message || "",
        };

        setErrors(newErrors);

        // Show general error toast
        toast.error("Please fix the validation errors");
      } else {
        toast.error("Failed to create product!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
    }));
  };

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(Number(digits));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCurrency(value);
    setFormData((prev) => ({
      ...prev,
      harga: formattedValue,
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to={"/dashboard/products"}>
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
            <Box className="w-6 h-6 text-primary" />
            Create New Product
          </h1>
          <p className="text-muted-foreground">
            Add a new product to your inventory
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name Field */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              Product Name
            </Label>
            <Input
              id="nama"
              name="nama"
              placeholder="Premium Headphones"
              value={formData.nama}
              onChange={handleChange}
              required
              autoFocus
              className={errors.nama ? "border-red-500" : ""}
            />
            <ErrorMessage message={errors.nama} />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category_id" className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              Category
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {category.map((category, i) => (
                  <SelectItem key={i} value={String(category.id)}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          String(category.id) === "1"
                            ? "bg-purple-500"
                            : String(category.id) === "2"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                      />
                      {category.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorMessage message={errors.category_id} />
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <Label htmlFor="harga" className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              Price (IDR)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <Input
                id="harga"
                name="harga"
                value={formData.harga}
                onChange={handlePriceChange}
                placeholder="1,000,000"
                className={`pl-10 ${errors.harga ? "border-red-500" : ""}`}
                required
              />
            </div>
            <ErrorMessage message={errors.harga} />
          </div>

          {/* Stock Field */}
          <div className="space-y-2">
            <Label htmlFor="stok" className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              Stock
            </Label>
            <Input
              id="stok"
              name="stok"
              type="number"
              value={formData.stok}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={errors.stok ? "border-red-500" : ""}
              required
            />
            <ErrorMessage message={errors.stok} />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
