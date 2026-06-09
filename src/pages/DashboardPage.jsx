import {
  ArrowRight,
  BadgePercent,
  Boxes,
  CreditCard,
  Layers3,
  PackagePlus,
  Ruler,
  Tags,
  Truck,
  ShoppingCart,
  Image,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";

const setupSteps = [
  { title: "Tạo danh mục", icon: Layers3, path: "/categories" },
  // { title: "Tạo thương hiệu", icon: Tags, path: "/brands" },
  { title: "Tạo thuộc tính", icon: Ruler, path: "/attributes" },
  { title: "Tạo vận chuyển", icon: Truck, path: "/shipping-methods" },
  { title: "Tạo thanh toán", icon: CreditCard, path: "/payment-methods" },
  { title: "Tạo mã giảm giá", icon: BadgePercent, path: "/coupons" },
  { title: "Tạo sản phẩm", icon: PackagePlus, path: "/products" },
  { title: "Quản lý đơn hàng", icon: ShoppingCart, path: "/orders" },
  { title: "Quản lý tồn kho", icon: Boxes, path: "/inventory" },

  { title: "Quản lý banner", icon: Image, path: "/banners" },
  { title: "Quản lý chatbot", icon: MessageSquare, path: "/chatbot" },
];

const DashboardPage = () => {
  return (
    <div>
      <PageHeader badge="Quy trình Admin" title="Thiết lập dữ liệu TLUSport" />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {setupSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <Link
              key={step.path}
              to={step.path}
              className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon />
                </div>
                <span className="text-xs font-black text-neutral-300">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-lg font-black">{step.title}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-blue-600">
                Mở module{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
