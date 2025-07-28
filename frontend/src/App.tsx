import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import DashboardLayout from "./layouts/dashboard-layouts";
import { Toaster } from "./components/ui/sonner";
import CreateUser from "./components/dashboard/users/create-users";
import LoginPage from "./pages/auth/login";
import ProtectedRoute from "./middleware/route-protected";
import { Users } from "./pages/users";
import { Categories } from "./pages/category";
import { Products } from "./pages/product";
import CreateProductPage from "./components/dashboard/product/create-product";
import CashierPage from "./pages/cashier";
import Transaction from "./pages/transaction";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="users" element={<Users />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="category" element={<Categories />} />
            <Route path="products" element={<Products />} />
            <Route path="products/create" element={<CreateProductPage />} />
            <Route path="cashier" element={<CashierPage />} />
            <Route path="transaction" element={<Transaction />} />
          </Route>
        </Routes>
      </Router>

      <Toaster />
    </>
  );
}

export default App;
