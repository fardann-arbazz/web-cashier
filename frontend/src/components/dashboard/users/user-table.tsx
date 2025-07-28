import { Edit, Shield, Trash2, User2, UserCog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User, UserTableProps } from "@/types/user-type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAvatarInitials } from "@/hooks/use-avatar";

interface UserTableRowProps {
  user: User;
  index: number;
  currentPage: number;
  limit: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const getRoleBadge = (role: string) => {
  const roleConfig = {
    admin: {
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
      icon: <Shield className="w-3 h-3 mr-1" />,
    },
    kasir: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
      icon: <UserCog className="w-3 h-3 mr-1" />,
    },
    default: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      icon: <User2 className="w-3 h-3 mr-1" />,
    },
  };

  return roleConfig[role as keyof typeof roleConfig] || roleConfig.default;
};

export const UserTableRow = ({
  user,
  index,
  currentPage,
  limit,
  onEdit,
  onDelete,
}: UserTableRowProps) => (
  <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
    <TableCell className="font-medium">
      {(currentPage - 1) * limit + index + 1}
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            {getAvatarInitials(user.username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.username}</p>
          <p className="text-sm text-muted-foreground">
            {user.email || "No email"}
          </p>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Badge
        variant="outline"
        className={`flex items-center ${getRoleBadge(user.role).color}`}
      >
        {getRoleBadge(user.role).icon}
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </Badge>
    </TableCell>
    <TableCell>
      <span className="text-sm text-muted-foreground">
        {user.last_active || "Never"}
      </span>
    </TableCell>
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => onEdit(user)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-red-500 text-white hover:bg-red-600"
          onClick={() => onDelete(user)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

export const UserTable = ({
  users,
  currentPage,
  limit,
  onEdit,
  onDelete,
}: UserTableProps) => (
  <Table className="min-w-full">
    <TableHeader className="bg-gray-50 dark:bg-gray-700">
      <TableRow>
        <TableHead className="w-12">No</TableHead>
        <TableHead>User</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Last Active</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {users.map((user, index) => (
        <UserTableRow
          key={user.id}
          user={user}
          index={index}
          currentPage={currentPage}
          limit={limit}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </TableBody>
  </Table>
);
