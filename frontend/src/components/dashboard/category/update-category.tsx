import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category-type";
import { toast } from "sonner";
import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";

interface FormValues {
  title: string;
}

interface UpdateCategoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export const UpdateCategory = ({
  open,
  onOpenChange,
  category,
  onSuccess,
}: UpdateCategoryProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      title: category?.title || "",
    },
    mode: "onChange",
  });

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        title: category.title,
      });
    }
  }, [category]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    // Manual validation
    if (values.title.length < 2) {
      form.setError("title", {
        type: "manual",
        message: "Category name must be at least 2 characters.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // API call to update category
      await API.put(
        `/categories/${category?.id}/update`,
        {
          title: values.title,
        },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      toast.success("Update category success");

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Update category failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            <span>Update Category</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Electronics"
                      {...field}
                      className="focus-visible:ring-2 focus-visible:ring-primary"
                      onChange={(e) => {
                        field.onChange(e);
                        if (
                          e.target.value.length > 0 &&
                          e.target.value.length < 2
                        ) {
                          form.setError("title", {
                            type: "manual",
                            message:
                              "Category name must be at least 2 characters.",
                          });
                        } else {
                          form.clearErrors("title");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
