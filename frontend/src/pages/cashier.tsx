import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProdutcsService } from "@/service/api/product-service";
import type { Product } from "@/types/product-type";
import { useDebounce } from "@/hooks/use-debounce";
import API from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

interface CartItem extends Product {
  quantity: number;
}

const CashierPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerPayment, setCustomerPayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { user } = useAuth();

  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const fetchProducts = async (page: number = 1, search: string = "") => {
    try {
      setIsLoading(true);
      const res = await fetchProdutcsService(page, search);

      setProducts(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Gagal memuat produk");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on initial load and when search/page changes
  useEffect(() => {
    fetchProducts(1, debouncedSearch);
  }, [debouncedSearch]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.total_pages) return;
    fetchProducts(page, debouncedSearch);
  };

  // Helper functions (same as before)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const parseCurrency = (value: string) => {
    return parseInt(value.replace(/\D/g, "")) || 0;
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = numericValue
      ? formatCurrency(parseInt(numericValue))
      : "";
    setCustomerPayment(formattedValue);
  };

  // Cart operations (same as before)
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem && existingItem.quantity >= product.stok) {
        toast.warning(`Stok tersisa hanya ${product.stok}`);
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stok < 1) {
          toast.warning("Produk ini habis");
          return prevCart;
        }
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) => {
      const product = products.find((p) => p.id === id);
      const existingItem = prevCart.find((item) => item.id === id);

      if (product && existingItem && newQuantity > product.stok) {
        toast.warning(`Stok tersisa hanya ${product.stok}`);
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: product.stok } : item
        );
      }

      return prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Transaction calculations
  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  };

  const getChange = () => {
    const paymentAmount = parseCurrency(customerPayment);
    return paymentAmount - getTotal();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning("Keranjang kosong");
      return;
    }

    // Validation for cash payment
    if (
      paymentMethod === "cash" &&
      parseCurrency(customerPayment) < getTotal()
    ) {
      toast.error("Pembayaran kurang");
      return;
    }

    // Validation for transfer payment
    if (
      paymentMethod === "transfer" &&
      parseCurrency(customerPayment) !== getTotal()
    ) {
      toast.error("Jumlah transfer harus sama dengan total belanja");
      return;
    }

    setIsProcessing(true);

    try {
      // Convert cart items to API format
      const transactionItems = cart.map((item) => ({
        product_id: parseInt(item.id), // Ensure it's a number
        quantity: item.quantity,
      }));

      // Prepare request payload
      const requestPayload = {
        cashier_id: user?.id,
        paid_amount:
          paymentMethod === "cash"
            ? parseCurrency(customerPayment) // Convert to number
            : getTotal(), // For non-cash, use total amount
        payment_method: paymentMethod,
        items: transactionItems,
      };

      await API.post("/transaction", requestPayload, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      fetchProducts();
      toast.success("Transaksi berhasil!");
      setCart([]);
      setCustomerPayment("");
    } catch (error: any) {
      console.error("Transaction error:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Transaksi gagal");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 md:p-6 mt-12">
      {/* Product List Section */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="po-0 gap-0">
          <CardHeader className="p-4 pb-2 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="w-5 h-5" />
                Daftar Produk
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <Search className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">
                  {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Coba dengan kata kunci lain"
                    : "Silakan tambahkan produk terlebih dahulu"}
                </p>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Reset pencarian
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map((product) => {
                    const cartItem = cart.find(
                      (item) => item.id === product.id
                    );
                    const inCartQuantity = cartItem ? cartItem.quantity : 0;
                    const availableStock = product.stok - inCartQuantity;

                    return (
                      <div
                        key={product.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-gray-900"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{product.nama}</h3>
                            <p className="text-sm text-muted-foreground">
                              {product.category_title}
                            </p>
                          </div>
                          <Badge
                            variant={
                              availableStock > 3
                                ? "default"
                                : availableStock > 0
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {availableStock > 0
                              ? `Stok: ${availableStock}`
                              : "Habis"}
                          </Badge>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="font-bold">
                            {formatCurrency(product.harga)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            disabled={availableStock < 1}
                            className="h-8 px-3"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan{" "}
                      <span className="font-medium">
                        {(pagination.current_page - 1) * pagination.limit + 1}-
                        {Math.min(
                          pagination.current_page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium">{pagination.total}</span>{" "}
                      produk
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.current_page === 1}
                        className="hidden sm:flex h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="sr-only">Halaman pertama</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Halaman sebelumnya</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.total_pages) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.total_pages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.current_page <= 3) {
                              pageNum = i + 1;
                            } else if (
                              pagination.current_page >=
                              pagination.total_pages - 2
                            ) {
                              pageNum = pagination.total_pages - 4 + i;
                            } else {
                              pageNum = pagination.current_page - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pageNum === pagination.current_page
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                          pagination.current_page === pagination.total_pages
                        }
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Halaman berikutnya</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.total_pages)}
                        disabled={
                          pagination.current_page === pagination.total_pages
                        }
                        className="hidden sm:flex h-8 w-8 p-0"
                      >
                        <ChevronsRight className="h-4 w-4" />
                        <span className="sr-only">Halaman terakhir</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Section */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5" />
              Transaksi
              <Badge variant="secondary" className="ml-auto">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} item
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium">Keranjang kosong</h3>
                <p className="text-sm text-muted-foreground">
                  Tambahkan produk dari daftar di samping
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[50%]">Produk</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => {
                        const product = products.find((p) => p.id === item.id);
                        const availableStock = product ? product.stok : 0;

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/50">
                            <TableCell className="py-2">
                              <div className="font-medium">{item.nama}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(item.harga)}
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  disabled={item.quantity >= availableStock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium py-2">
                              {formatCurrency(item.harga * item.quantity)}
                            </TableCell>
                            <TableCell className="py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-3" />

                {/* Payment Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(getTotal())}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label>Metode Pembayaran</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          paymentMethod === "cash" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPaymentMethod("cash")}
                      >
                        Tunai
                      </Button>
                      <Button
                        variant={
                          paymentMethod === "transfer" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPaymentMethod("transfer")}
                      >
                        Transfer
                      </Button>
                    </div>
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="space-y-2">
                      <Label>Uang Customer</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          value={customerPayment}
                          onChange={handlePaymentChange}
                          placeholder="Masukkan jumlah pembayaran"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash" && customerPayment && (
                    <div className="flex justify-between font-medium">
                      <span>Kembalian</span>
                      <span
                        className={
                          getChange() >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {formatCurrency(Math.abs(getChange()))}
                        {getChange() < 0 && " (Kurang)"}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button
              onClick={handleCheckout}
              disabled={
                isProcessing ||
                cart.length === 0 ||
                (paymentMethod === "cash" &&
                  (customerPayment === "" || getChange() < 0))
              }
              className="w-full h-12 gap-2"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  <span>Selesaikan Transaksi</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CashierPage;
