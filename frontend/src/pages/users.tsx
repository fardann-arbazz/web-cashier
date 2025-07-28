import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, User } from "@/types/user-type";
import { UserHeader } from "@/components/dashboard/users/user-header";
import { UserSearch } from "@/components/dashboard/users/user-search";
import { UserStats } from "@/components/dashboard/users/user-stats";
import { UserSkeleton } from "@/components/dashboard/users/user-skeleton";
import { UserTable } from "@/components/dashboard/users/user-table";
import { UserEmptyState } from "@/components/dashboard/users/user-empty-state";
import { UserPagination } from "@/components/dashboard/users/user-pagination";
import { DeleteUserModal } from "@/components/dashboard/users/delete-users";
import { UpdateUserModal } from "@/components/dashboard/users/update-users";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export const Users = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  const debouncedSearch = useDebounce(searchQuery, 500);
  const [countAdmin, setCountAdmin] = useState(0);
  const [countCashier, setCountCashier] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const fetchUsers = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const res = await API.get<ApiResponse>("/users", {
        params: { page, search },
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      setUsers(res.data.data);
      setCountAdmin(res.data.total_admin);
      setCountCashier(res.data.total_kasir);
      setPagination(res.data.pagination);
      setCurrentPage(res.data.pagination.current_page);
      setSearchParams((prev) => {
        prev.set("page", res.data.pagination.current_page.toString());
        return prev;
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, debouncedSearch);
  }, [debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchUsers();
  };

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    setSearchQuery(search);
    fetchUsers(pageParam, search);
  }, []);

  return (
    <>
      <div className="flex flex-col h-full mt-12">
        <div className="flex flex-col space-y-4 sm:p-6 p-0 pb-0">
          <UserHeader />
          <UserSearch searchQuery={searchQuery} onSearch={handleSearch} />
        </div>

        <div className="flex-1 sm:p-6 p-0 pt-4 overflow-auto">
          <UserStats
            total={pagination.total}
            adminCount={countAdmin}
            cashierCount={countCashier}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
            {isLoading ? (
              <UserSkeleton />
            ) : users.length > 0 ? (
              <UserTable
                users={users}
                currentPage={currentPage}
                limit={pagination.limit}
                onEdit={(user) => {
                  setSelectedUser(user);
                  setUpdateModalOpen(true);
                }}
                onDelete={(user) => {
                  setSelectedUser(user);
                  setDeleteModalOpen(true);
                }}
              />
            ) : (
              <UserEmptyState
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
              />
            )}
          </div>

          {users.length > 0 && (
            <UserPagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        user={selectedUser}
        onSuccess={() => fetchUsers(currentPage, searchQuery)}
      />

      <UpdateUserModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        user={selectedUser}
        onSuccess={() => fetchUsers(currentPage, searchQuery)}
      />
    </>
  );
};
