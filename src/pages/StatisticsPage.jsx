import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  ShoppingCart,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";
import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import TopProductsList from "@/components/dashboard/TopProductsList";
import OrdersTrendChart from "@/components/dashboard/OrdersTrendChart";
import dashboardServices from "@/services/dashboardServices";
import userServices from "@/services/userServices";

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Data states
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [totalRoleUsers, setTotalRoleUsers] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Overview & Category Revenue & Top Products (limit 5)
      const [overviewRes, categoryRes, topProductsRes, yearlyRevenueRes] =
        await Promise.all([
          dashboardServices.getOverview(),
          dashboardServices.getCategoryRevenue(),
          dashboardServices.getTopProducts(10), // fetch top 10 products
          dashboardServices.getRevenueChart(365), // Fetch 365 days for monthly aggregation
        ]);

      if (overviewRes?.data) {
        setOverview(overviewRes.data);
      }

      try {
        const usersRes = await userServices.getAllUsers(1, 1000);
        if (usersRes?.data?.items) {
          const count = usersRes.data.items.filter(
            (u) => u.roles && u.roles.includes("ROLE_USER"),
          ).length;
          setTotalRoleUsers(count);
        }
      } catch (err) {
        console.error("Lỗi khi đếm số lượng ROLE_USER:", err);
      }
      if (categoryRes?.data) {
        setCategoryRevenue(categoryRes.data);
      }
      if (topProductsRes?.data) {
        setTopProducts(topProductsRes.data);
      }

      // Group 365 days data into 12 months for MonthlyBarChart
      if (yearlyRevenueRes?.data) {
        const aggregated = aggregateByMonth(yearlyRevenueRes.data);
        setMonthlyData(aggregated);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê tổng quan:", error);
      toast.error("Không thể tải một số chỉ số thống kê.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch daily charts whenever 'days' selector changes
  const fetchChartData = async () => {
    try {
      const res = await dashboardServices.getRevenueChart(days);
      if (res?.data) {
        setRevenueData(res.data);
      }
    } catch (error) {
      console.error(`Lỗi khi tải dữ liệu biểu đồ (${days} ngày):`, error);
      toast.error("Lỗi tải dữ liệu biểu đồ.");
    }
  };

  // Aggregate daily records to 12 months (T1 - T12)
  const aggregateByMonth = (dailyData) => {
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      month: `T${i + 1}`,
      totalOrders: 0,
      totalRevenue: 0,
    }));

    dailyData.forEach((item) => {
      if (!item.reportDate) return;
      const date = new Date(item.reportDate);
      if (isNaN(date.getTime())) return;
      const monthIndex = date.getMonth(); // 0 - 11
      if (monthIndex >= 0 && monthIndex < 12) {
        monthsData[monthIndex].totalOrders += item.totalOrders || 0;
        monthsData[monthIndex].totalRevenue += item.totalRevenue || 0;
      }
    });

    return monthsData;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [days]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-bold text-neutral-500">
            Đang tải dữ liệu thống kê...
          </p>
        </div>
      </div>
    );
  }

  // Get top selling product details for overview card
  const topProduct = topProducts[0] || null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader badge="Báo cáo" title="Thống kê báo cáo" />
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 shadow-sm">
          Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN")} -{" "}
          {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      {/* Grid 5 thẻ Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Doanh thu"
          value={formatVND(overview.totalRevenue || 0)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Đơn hàng"
          value={(overview.totalOrders || 0).toLocaleString("vi-VN")}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Người dùng"
          value={totalRoleUsers.toLocaleString("vi-VN")}
          icon={Users}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Bán chạy nhất"
          value={topProduct ? topProduct.productName : "Đang xử lý"}
          icon={Award}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Đơn chờ xử lý"
          value={(overview.pendingOrders || 0).toLocaleString("vi-VN")}
          icon={ShoppingCart}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Row 2: Biểu đồ doanh thu (2/3) & Biểu đồ danh mục (1/3) */}
      <div className="grid gap-6 lg:grid-cols-1">
        <div className="lg:col-span-1 h-full">
          <RevenueChart data={revenueData} days={days} onDaysChange={setDays} />
        </div>
        {/* <div className="lg:col-span-1 h-full">
          <CategoryPieChart data={categoryRevenue} />
        </div> */}
      </div>

      {/* Row 3: Biểu đồ tháng (1/3) & Top sản phẩm (1/3) & Biến động đơn hàng (1/3) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MonthlyBarChart data={monthlyData} />
        <TopProductsList products={topProducts.slice(0, 5)} />
        <OrdersTrendChart data={revenueData} />
      </div>
    </div>
  );
};

export default StatisticsPage;
