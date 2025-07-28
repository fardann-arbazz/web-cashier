import { Clock, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import React from "react";
import { TransactionDetail } from "./transaction-detail";

interface TransactionTableProps {
  transactions: any[];
  expandedTransaction: number | null;
  toggleExpand: (id: number) => void;
  formatDate: (dateString: string) => string;
}

export const TransactionTable = ({
  transactions,
  expandedTransaction,
  toggleExpand,
  formatDate,
}: TransactionTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Invoice</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Kasir</TableHead>
          <TableHead>Metode</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <React.Fragment key={transaction.id}>
              <TableRow className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <span className="font-mono text-sm">
                    {transaction.invoice_number.slice(0, 8)}...
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDate(transaction.created_at)}
                  </div>
                </TableCell>
                <TableCell>{transaction.cashier.username}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {transaction.payment_method}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(transaction.total_amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === "paid"
                        ? "default"
                        : transaction.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {transaction.status === "paid"
                      ? "Berhasil"
                      : transaction.status === "pending"
                      ? "Pending"
                      : "Gagal"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(transaction.id)}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">Detail</span>
                  </Button>
                </TableCell>
              </TableRow>
              {expandedTransaction === transaction.id && (
                <TransactionDetail
                  transaction={transaction}
                  formatDate={formatDate}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              Tidak ada transaksi ditemukan
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
