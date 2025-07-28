import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UserHeader = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team members and their permissions
        </p>
      </div>
    </div>
    <Link to="/dashboard/users/create">
      <Button>
        <Plus className="w-4 h-4" />
        <span>Add User</span>
      </Button>
    </Link>
  </div>
);
