import { ChevronDown, LogOut, User, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getAvatarInitials } from "@/hooks/use-avatar";

const ProfileDropdown = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  if (!user) return <p>Loading....</p>;

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await API.delete("/logout", {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      logout();
      toast.success("Logout successfully!");
      navigate("/");
    } catch (error) {
      console.error("Internal server error:", error);
      toast.error("Logout failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative cursor-pointer rounded-full p-0  dark:hover:bg-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/john-doe.jpg" alt="John Doe" />
              <AvatarFallback className="bg-black text-white">
                {getAvatarInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex md:flex-col md:items-start">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.username}
              </p>
              <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                {user.role}
              </p>
            </div>
            <ChevronDown className="hidden md:block w-4 h-4 text-gray-500 dark:text-gray-400 ml-1 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 mt-2 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
            <User className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 rounded-full animate-spin" />
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
