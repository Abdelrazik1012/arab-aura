import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PlatformProvider } from "./context/PlatformContext";

// 🌐 استدعاء الشاشات العامة
import LandingScreen from "./pages/LandingScreen";
import LoginScreen from "./pages/LoginScreen";
import RegisterRoleScreen from "./pages/RegisterRoleScreen";
import RegisterFormScreen from "./pages/RegisterFormScreen";
import AboutUsPage from "./pages/AboutUsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// 👤 استدعاء صفحات موديول العميل (Customer Module)
import CustomerProductsPage from "./pages/customer/CustomerProductsPage";
import ProductDetailsPage from "./pages/customer/ProductDetailsPage";
import CustomerWalletPage from "./pages/customer/CustomerWalletPage";
import CustomerCartPage from "./pages/customer/CustomerCartPage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import CustomerNotificationsPage from "./pages/customer/CustomerNotificationsPage";
import CustomerReviewsPage from "./pages/customer/CustomerReviewsPage";

// 🏪 استدعاء صفحات موديول البائع بالكامل (Seller Module)
import SellerDashboardScreen from "./pages/seller/SellerDashboardScreen";
import SellerProductsPage from "./pages/seller/SellerProductsPage";
import SellerBrandsPage from "./pages/seller/SellerBrandsPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";
import SellerWalletPage from "./pages/seller/SellerWalletPage";

// 🚗 استدعاء صفحات موديول السائق بالكامل (Driver Module)
import DriverDashboardScreen from "./pages/driver/DriverDashboardScreen";
import DriverOrdersPage from "./pages/driver/DriverOrdersPage";
import DriverWalletPage from "./pages/driver/DriverWalletPage";

// 📦 استدعاء تخطيط وصفحات موديول المُجمّع (Collector Module & Layout)
import CollectorLayout from "./layouts/CollectorLayout";
import CollectorDashboardScreen from "./pages/collector/CollectorDashboardScreen";
import CollectorMapScreen from "./pages/collector/CollectorMapScreen";
import CollectorOrdersScreen from "./pages/collector/CollectorOrdersScreen";
import CollectorPackagesScreen from "./pages/collector/CollectorPackagesScreen";
import CollectorProfileScreen from "./pages/collector/CollectorProfileScreen";

// 🛡️ استدعاء صفحات وتخطيط موديول الأدمن (Admin Module & Layout)
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardScreen from "./pages/admin/AdminDashboardScreen";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminApprovalsPage from "./pages/admin/AdminApprovalsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

// 🛡️ استدعاء ودجت التنقل السريع للأدمن
import AdminFloatingWidget from "./components/AdminFloatingWidget";

// حماية وتوجيه المسارات مع إتاحة الوصول الشامل للأدمن لجميع الصفحات
const RoleBasedRoute: React.FC<{
  allowedRole: string;
  children: React.ReactNode;
}> = ({ allowedRole, children }) => {
  const rawRole = localStorage.getItem("user_role") || "user";
  // توحيد دور العميل سواء كان "customer" أو "user" لمنع التوجيه اللانهائي
  const currentRole = rawRole === "customer" ? "user" : rawRole;
  const normalizedAllowedRole = allowedRole === "customer" ? "user" : allowedRole;

  const isSuperAdmin =
    localStorage.getItem("original_admin") === "true" ||
    currentRole === "admin";

  // للأدمن صلاحية الوصول الشامل لجميع الشاشات بصفته الإدارية
  if (isSuperAdmin || currentRole === normalizedAllowedRole) {
    return <>{children}</>;
  }

  switch (currentRole) {
    case "seller":
      return <Navigate to="/seller/dashboard" replace />;
    case "driver":
      return <Navigate to="/driver/dashboard" replace />;
    case "collector":
      return <Navigate to="/collector/dashboard" replace />;
    default:
      return <Navigate to="/customer/products" replace />;
  }
};

const AppContent: React.FC = () => {
  return (
    <>
      {/* 🛡️ زر عائم للتنقل السريع للأدمن عند معاينة الواجهات الأخرى */}
      <AdminFloatingWidget />

      <Routes>
        {/* 🌐 الشاشات العامة */}
        <Route path="/" element={<LandingScreen />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterRoleScreen />} />
        <Route path="/register-form" element={<RegisterFormScreen />} />

        {/* 👤 1. موديول صفحات المستهلك العادي */}
        <Route
          path="/customer/products"
          element={
            <RoleBasedRoute allowedRole="user">
              <CustomerProductsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/product/:id"
          element={
            <RoleBasedRoute allowedRole="user">
              <ProductDetailsPage />
            </RoleBasedRoute>
          }
        />
        <Route path="/customer/wallet" element={<CustomerWalletPage />} />
        <Route
          path="/customer/cart"
          element={
            <RoleBasedRoute allowedRole="user">
              <CustomerCartPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <RoleBasedRoute allowedRole="user">
              <CustomerProfilePage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <RoleBasedRoute allowedRole="user">
              <CustomerNotificationsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/reviews"
          element={
            <RoleBasedRoute allowedRole="user">
              <CustomerReviewsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer-profile"
          element={<Navigate to="/customer/products" replace />}
        />

        {/* 🏪 2. موديول البائع المتكامل */}
        <Route
          path="/seller/dashboard"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerDashboardScreen />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/seller-dashboard"
          element={<Navigate to="/seller/dashboard" replace />}
        />
        <Route
          path="/seller/products"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerProductsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/seller/brands"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerBrandsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerOrdersPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/seller/wallet"
          element={
            <RoleBasedRoute allowedRole="seller">
              <SellerWalletPage />
            </RoleBasedRoute>
          }
        />

        {/* 🚗 3. موديول السائق المتكامل */}
        <Route
          path="/driver/dashboard"
          element={
            <RoleBasedRoute allowedRole="driver">
              <DriverDashboardScreen />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/driver/orders"
          element={
            <RoleBasedRoute allowedRole="driver">
              <DriverOrdersPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/driver/wallet"
          element={
            <RoleBasedRoute allowedRole="driver">
              <DriverWalletPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/driver-dashboard"
          element={<Navigate to="/driver/dashboard" replace />}
        />

        {/* 📦 4. موديول المُجمّع (Collector Module) */}
        <Route
          element={
            <RoleBasedRoute allowedRole="collector">
              <CollectorLayout />
            </RoleBasedRoute>
          }
        >
          <Route
            path="/collector/dashboard"
            element={<CollectorDashboardScreen />}
          />
          <Route path="/collector/map" element={<CollectorMapScreen />} />
          <Route path="/collector/orders" element={<CollectorOrdersScreen />} />
          <Route
            path="/collector/packages"
            element={<CollectorPackagesScreen />}
          />
          <Route
            path="/collector/profile"
            element={<CollectorProfileScreen />}
          />
        </Route>

        <Route
          path="/collector-dashboard"
          element={<Navigate to="/collector/dashboard" replace />}
        />

        {/* 🛡️ 5. موديول الأدمن المتكامل (Admin Module Routes) */}
        <Route
          element={
            <RoleBasedRoute allowedRole="admin">
              <AdminLayout />
            </RoleBasedRoute>
          }
        >
          <Route
            path="/admin/dashboard"
            element={<AdminDashboardScreen />}
          />
          <Route
            path="/admin/orders"
            element={<AdminOrdersPage />}
          />
          <Route
            path="/admin/approvals"
            element={<AdminApprovalsPage />}
          />
          <Route
            path="/admin/users"
            element={<AdminUsersPage />}
          />
        </Route>
        <Route
          path="/admin-dashboard"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* إعادة التوجيه الافتراضية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PlatformProvider>
          <Router>
            <AppContent />
          </Router>
        </PlatformProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
