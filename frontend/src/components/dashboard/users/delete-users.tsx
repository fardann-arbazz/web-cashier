import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import API from "@/lib/axios";
import { toast } from "sonner";

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
    role: string;
  } | null;
  onSuccess?: () => void;
}

export const DeleteUserModal = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: DeleteUserModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Replace with your actual API call
      await API.delete(`/users/${user.id}/delete`, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      toast.success("Deleting users successfully!");

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Error deleting users!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete User
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="py-4">
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
              <h4 className="font-medium text-red-800 dark:text-red-200">
                Warning: This action cannot be undone
              </h4>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                All data associated with this user will be permanently removed
                from our servers.
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this user account? This action
              will immediately revoke all access and cannot be reversed.
            </p>
          </div>
        </DialogDescription>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete User
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
