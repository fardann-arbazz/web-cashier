import { useForm } from "react-hook-form";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FormValues {
  title: string;
}

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CategoryForm = ({
  open,
  onOpenChange,
  onSuccess,
}: CategoryFormProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
    },
    mode: "onChange",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    // validasi input title
    if (values.title.length < 3) {
      form.setError("title", {
        type: "manual",
        message: "Category name must be at least 2 characters.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await API.post(
        "/categories",
        {
          title: values.title,
        },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      onSuccess();
      toast.success("Created category successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed crated category!");
      console.log("errorr data", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
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
                      onChange={(e) => {
                        field.onChange(e);
                        if (
                          e.target.value.length > 0 &&
                          e.target.value.length < 3
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 rounded-full animate-spin" />
                ) : (
                  "Save Category"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
