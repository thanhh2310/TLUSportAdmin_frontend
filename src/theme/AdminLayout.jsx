import React, { useState, useEffect } from "react";
import {
  BadgePercent,
  Boxes,
  CreditCard,
  Home,
  Layers3,
  LogOut,
  PackagePlus,
  Ruler,
  ShieldCheck,
  Tags,
  Truck,
  ShoppingCart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Image,
  MessageSquare,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { clearAdminTokens, getAdminRole } from "@/lib/auth";
import authServices from "@/services/authServices";
import userServices from "@/services/userServices";

const navItems = [
  { title: "Tổng quan", path: "/", icon: Home },
  { title: "Thống kê", path: "/statistics", icon: BarChart3 },
  { title: "Người dùng", path: "/users", icon: Users },
  { title: "Tồn kho", path: "/inventory", icon: Boxes },
  { title: "Danh mục", path: "/categories", icon: Layers3 },
  { title: "Thương hiệu", path: "/brands", icon: Tags },
  { title: "Thuộc tính", path: "/attributes", icon: Ruler },
  { title: "Vận chuyển", path: "/shipping-methods", icon: Truck },
  { title: "Thanh toán", path: "/payment-methods", icon: CreditCard },
  { title: "Mã giảm giá", path: "/coupons", icon: BadgePercent },
  { title: "Sản phẩm", path: "/products", icon: PackagePlus },
  { title: "Đơn hàng", path: "/orders", icon: ShoppingCart },
  { title: "Banners", path: "/banners", icon: Image },
  { title: "Quản lý Chatbot", path: "/chatbot", icon: MessageSquare },
];

const pageNames = {
  "/": "Tổng quan hệ thống",
  "/statistics": "Thống kê báo cáo",
  "/users": "Quản lý người dùng",
  "/inventory": "Quản lý tồn kho",
  "/categories": "Quản lý danh mục",
  "/brands": "Quản lý thương hiệu",
  "/attributes": "Quản lý thuộc tính",
  "/shipping-methods": "Quản lý vận chuyển",
  "/payment-methods": "Quản lý thanh toán",
  "/coupons": "Quản lý mã giảm giá",
  "/products": "Quản lý sản phẩm",
  "/orders": "Quản lý đơn hàng",
  "/banners": "Quản lý Banner",
  "/chatbot": "Quản lý Chatbot",
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userServices.getMyProfile();
        if (res && res.data) {
          setCurrentUser(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
      }
    };
    fetchProfile();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newVal = !prev;
      localStorage.setItem("sidebarCollapsed", String(newVal));
      return newVal;
    });
  };

  const handleLogout = async () => {
    try {
      const rfToken = localStorage.getItem("adminRefreshToken");
      if (rfToken) {
        await authServices.logout(rfToken);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      clearAdminTokens();
      navigate("/login", { replace: true });
    }
  };

  const role = getAdminRole();

  // Chặn Staff truy cập các URL quản trị khác bằng cách gõ tay
  const allowedPathsForStaff = [
    "/orders",
    "/inventory",
    "/products",
    "/statistics",
    "/coupons",
    "/banners",
    "/chatbot",
    "/users",
  ];
  if (
    role === "ROLE_STAFF" &&
    !allowedPathsForStaff.includes(location.pathname)
  ) {
    return <Navigate to="/statistics" replace />;
  }

  // Lọc các item hiển thị trên Sidebar
  const filteredNavItems = navItems.filter((item) => {
    if (role === "ROLE_STAFF") {
      return allowedPathsForStaff.includes(item.path);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-neutral-950">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-neutral-200 bg-neutral-950 text-white lg:flex lg:flex-col transition-all duration-300 ${
          isCollapsed ? "w-20 p-3 items-center" : "w-65 p-5"
        }`}
      >
        {/* Toggle Button for collapsing/expanding desktop sidebar */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 z-50 hidden lg:flex size-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-950 shadow-sm hover:bg-neutral-100 transition-transform cursor-pointer"
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>

        <div
          className={`bg-white text-neutral-950 transition-all duration-300 ${
            isCollapsed
              ? "rounded-2xl p-1 size-12 flex items-center justify-center"
              : "rounded-3xl p-4 w-full"
          }`}
        >
          <div className="flex items-center gap-3 justify-center">
            <div className="flex size-10 items-center justify-center rounded-2xl text-white shrink-0">
              <img
                src="/logo/TLUSportLogo.svg"
                alt="logo"
                className="size-full object-contain"
              />
            </div>
            <div
              className={`transition-opacity duration-200 ${isCollapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100 block"}`}
            >
              <h1 className="text-xl font-black whitespace-nowrap">TLUSport</h1>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                Quản trị
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                title={isCollapsed ? item.title : ""}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl py-3 text-sm font-bold transition-all duration-300 ${
                    isCollapsed ? "justify-center px-0 size-12" : "px-4 gap-3"
                  } ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-xl"
                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="size-5 shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${isCollapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100 block"}`}
                >
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div
          className={`rounded-3xl bg-white/10 transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}
        >
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center justify-center rounded-2xl bg-white text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-200 ${
              isCollapsed ? "size-12 p-0" : "px-4 py-3 gap-2"
            }`}
            title={isCollapsed ? "Đăng xuất" : ""}
          >
            <LogOut className="size-4 shrink-0" />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}
      >
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#f5f6f1]/90 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
                Bảng điều khiển
              </p>
              <h2 className="text-2xl font-black">
                {pageNames[location.pathname] || "TLUSport Admin"}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              {/* Profile Widget */}
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="avatar"
                  className="size-10 rounded-full border border-neutral-200 object-cover"
                />
                <div className="hidden md:block">
                  <h4 className="text-sm font-bold text-neutral-950 leading-tight">
                    {currentUser
                      ? `${currentUser.lastName || ""} ${currentUser.firstName || ""}`.trim()
                      : role === "ROLE_ADMIN"
                        ? "Admin"
                        : "Staff"}
                  </h4>
                  <p className="text-xs font-medium text-neutral-500">
                    {role === "ROLE_ADMIN" ? "Quản trị viên" : "Nhân viên"}
                  </p>
                </div>
              </div>

              {/* Mobile logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-800 shadow-sm hover:bg-neutral-100 lg:hidden cursor-pointer"
              >
                <LogOut className="size-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
