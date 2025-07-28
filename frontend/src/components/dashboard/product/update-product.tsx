import { useEffect, useState } from "react";
import { Box, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/product-type";
import type { Category } from "@/types/category-type";
import { fetchCategories } from "@/service/api/category-service";
import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";

interface UpdateProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UpdateProductDialog = ({
  product,
  open,
  onOpenChange,
  onSuccess,
}: UpdateProductDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: product?.nama,
    harga: product?.harga ? product.harga.toString() : "",
    stok: product?.stok,
    category_id: product?.category_id,
  });

  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategory = async () => {
    try {
      const res = await fetchCategories();

      setCategories(res.data);
    } catch (error) {
      console.log("error data", error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    if (open && product) {
      setFormData({
        nama: product.nama,
        harga: product.harga ? product.harga.toString() : "",
        stok: product.stok,
        category_id: product.category_id,
      });
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API call to update
      await API.put(
        `/barang/${product?.id}/update`,
        {
          nama: formData.nama,
          harga: parseInt(formData.harga.replace(/\D/g, ""), 10), // menghapus Rp, titik, dll
          stok: parseInt(
            formData.stok !== undefined ? String(formData.stok) : "0",
            10
          ),
          category_id: parseInt(
            formData.category_id !== undefined
              ? String(formData.category_id)
              : "0",
            10
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      toast.success("Product updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: Number(value) }));
  };

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(Number(digits));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCurrency(value);
    setFormData((prev) => ({ ...prev, harga: formattedValue }));
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Box className="w-5 h-5 text-primary" />
            Update Product
          </AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to your product here. Click save when you're done.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="nama">Product Name</Label>
              <Input
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Product name"
                required
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={
                  formData.category_id !== undefined
                    ? String(formData.category_id)
                    : undefined
                }
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
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
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="harga">Price (IDR)</Label>
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
                  className="pl-10"
                  required
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stok">Stock</Label>
              <Input
                id="stok"
                name="stok"
                type="number"
                value={formData.stok}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdateProductDialog;
