import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductBadge } from "./product-badge";
import type { Product } from "@/types/product-type";
import type { User } from "@/types/user-type";
import { Badge } from "@/components/ui/badge";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  currentPage: number;
  perPage: number;
  user: User | null;
}

export const ProductTable = ({
  products,
  onEdit,
  onDelete,
  currentPage,
  perPage,
  user,
}: ProductTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className={isAdmin ? "bg-muted/50" : ""}>
          <TableRow>
            <TableHead className="w-[80px] text-center">No</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-center">Stok</TableHead>
            {isAdmin && (
              <TableHead className="w-[200px] text-right">Aksi</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product, i) => (
              <TableRow key={product.id} className="hover:bg-muted/50">
                <TableCell className="text-center font-medium">
                  {(currentPage - 1) * perPage + i + 1}
                </TableCell>
                <TableCell className="font-medium">{product.nama}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-sm">
                    {product.category_title}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.harga)}
                </TableCell>
                <TableCell className="text-center">
                  <ProductBadge stock={product.stok} />
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="h-8"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="ml-2 sr-only sm:not-sr-only">
                          Edit
                        </span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(product)}
                        className="h-8"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="ml-2 sr-only sm:not-sr-only">
                          Hapus
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                Tidak ada data produk
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
