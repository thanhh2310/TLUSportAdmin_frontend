import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import AdminLayout from "@/theme/AdminLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import StatisticsPage from "@/pages/StatisticsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import BrandsPage from "@/pages/BrandsPage";
import AttributesPage from "@/pages/AttributesPage";
import ShippingMethodsPage from "@/pages/ShippingMethodsPage";
import PaymentMethodsPage from "@/pages/PaymentMethodsPage";
import CouponsPage from "@/pages/CouponsPage";
import ProductsPage from "@/pages/ProductsPage";
import OrdersPage from "@/pages/OrdersPage";
import InventoryPage from "@/pages/InventoryPage";
import UsersPage from "@/pages/UsersPage";
import BannersPage from "@/pages/BannersPage";
import ChatbotManagementPage from "@/pages/ChatbotManagementPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: "statistics",
          element: <StatisticsPage />,
        },
        {
          path: "users",
          element: <UsersPage />,
        },
        {
          path: "inventory",
          element: <InventoryPage />,
        },
        {
          path: "categories",
          element: <CategoriesPage />,
        },
        {
          path: "brands",
          element: <BrandsPage />,
        },
        {
          path: "attributes",
          element: <AttributesPage />,
        },
        {
          path: "shipping-methods",
          element: <ShippingMethodsPage />,
        },
        {
          path: "payment-methods",
          element: <PaymentMethodsPage />,
        },
        {
          path: "coupons",
          element: <CouponsPage />,
        },
        {
          path: "products",
          element: <ProductsPage />,
        },
        {
          path: "orders",
          element: <OrdersPage />,
        },
        {
          path: "banners",
          element: <BannersPage />,
        },
        {
          path: "chatbot",
          element: <ChatbotManagementPage />,
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
