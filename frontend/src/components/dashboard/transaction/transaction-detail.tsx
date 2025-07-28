import { formatCurrency } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";

interface TransactionDetailProps {
  transaction: any;
  formatDate: (dateString: string) => string;
}

export const TransactionDetail = ({
  transaction,
  formatDate,
}: TransactionDetailProps) => {
  return (
    <TableRow className="bg-muted/20">
      <TableCell colSpan={7} className="p-0">
        <div className="p-4 pl-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <h4 className="font-medium">Detail Pembayaran</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium text-right">
                  {formatCurrency(transaction.total_amount)}
                </span>
                <span className="text-muted-foreground">Dibayar:</span>
                <span className="font-medium text-right">
                  {formatCurrency(transaction.paid_amount)}
                </span>
                <span className="text-muted-foreground">Kembalian:</span>
                <span className="font-medium text-right">
                  {formatCurrency(transaction.change_amount)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Item Pembelian</h4>
              <div className="space-y-2">
                {transaction.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Info Transaksi</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Invoice:</span>
                <span className="font-mono truncate max-w-[180px]">
                  {transaction.invoice_number}
                </span>
                <span className="text-muted-foreground">Kasir:</span>
                <span>{transaction.cashier.username}</span>
                <span className="text-muted-foreground">Waktu:</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
