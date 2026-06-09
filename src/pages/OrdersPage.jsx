import React, { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import orderServices from "@/services/orderServices";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Clock,
  ShoppingBag,
} from "lucide-react";
import OrderTabs from "@/components/orders/OrderTabs";
import OrderList from "@/components/orders/OrderList";
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import paymentServices from "@/services/paymentServices";
import OrderFilter, { PRICE_RANGES } from "@/components/orders/OrderFilter";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [actionLoading, setActionLoading] = useState({});
  const [returnDetails, setReturnDetails] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "Xác nhận",
    message: "",
    onConfirm: () => {},
    type: "primary",
  });
  const [searchOrderId, setSearchOrderId] = useState("");
  const [paymentMethodCode, setPaymentMethodCode] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const triggerConfirm = (
    message,
    onConfirm,
    type = "primary",
    title = "Xác nhận hành động",
  ) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  };

  const tabs = [
    { id: "ALL", label: "Tất cả", icon: ShoppingBag },
    { id: "PENDING", label: "Chờ xác nhận", icon: Clock },
    { id: "PROCESSING", label: "Đang chuẩn bị", icon: Package },
    { id: "SHIPPED", label: "Đang giao", icon: Truck },
    { id: "DELIVERED", label: "Đã giao", icon: CheckCircle },
    { id: "RETURN_REQUESTED", label: "Yêu cầu hoàn trả", icon: Clock },
    { id: "RETURNED", label: "Đã hoàn trả", icon: CheckCircle },
    { id: "RETURN_REJECTED", label: "Từ chối hoàn trả", icon: XCircle },
    { id: "CANCELLED", label: "Đã hủy", icon: XCircle },
  ];

  const fetchOrders = async (pageNum = page) => {
    setIsLoading(true);
    try {
      let res;
      const cleanOrderId = searchOrderId.trim().replace(/^0+/, "");

      if (cleanOrderId || paymentMethodCode || priceRange) {
        const params = {
          page: pageNum,
          size: pageSize,
        };

        const numericOrderId = parseInt(cleanOrderId, 10);
        if (!isNaN(numericOrderId)) {
          params.orderId = numericOrderId;
        }
        if (paymentMethodCode) {
          params.paymentMethodCode = paymentMethodCode;
        }
        if (priceRange) {
          const rangeObj = PRICE_RANGES.find((r) => r.value === priceRange);
          if (rangeObj) {
            if (rangeObj.min !== undefined) params.minTotal = rangeObj.min;
            if (rangeObj.max !== undefined) params.maxTotal = rangeObj.max;
          }
        }

        res = await orderServices.searchOrders(params);
      } else {
        res = await orderServices.getAllOrders(pageNum, pageSize);
      }
      setOrders(res?.data?.items || []);
      setTotalPages(res?.data?.totalPage || 1);
      console.log("order", res);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await paymentServices.getActivePaymentMethods();
      setPaymentMethods(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phương thức thanh toán:", error);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleViewDetail = async (order) => {
    setSelectedOrder(order);
    if (
      ["RETURN_REQUESTED", "RETURNED", "RETURN_REJECTED"].includes(
        order.orderStatus,
      ) &&
      !returnDetails[order.orderId]
    ) {
      try {
        const res = await orderServices.getReturnByOrderId(order.orderId);
        if (res?.data) {
          setReturnDetails((prev) => ({ ...prev, [order.orderId]: res.data }));
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết yêu cầu hoàn trả:", error);
      }
    }
  };

  const handleApproveReturn = (orderId, returnId) => {
    triggerConfirm(
      "Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu hoàn trả này và hoàn tiền cho khách hàng?",
      async () => {
        setActionLoading((prev) => ({ ...prev, [orderId]: true }));
        try {
          const adminNote = adminNotes[orderId] || "";
          const res = await orderServices.approveReturn(returnId, {
            adminNote,
          });
          toast.success(res.message || "Duyệt hoàn trả thành công!", {
            position: "top-right",
          });
          setAdminNotes((prev) => {
            const c = { ...prev };
            delete c[orderId];
            return c;
          });
          setReturnDetails((prev) => {
            const c = { ...prev };
            delete c[orderId];
            return c;
          });
          setSelectedOrder(null);
          fetchOrders();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Lỗi khi duyệt hoàn trả!",
            { position: "top-right" },
          );
        } finally {
          setActionLoading((prev) => ({ ...prev, [orderId]: false }));
        }
      },
      "danger",
      "Chấp nhận hoàn trả",
    );
  };

  const handleRejectReturn = (orderId, returnId) => {
    triggerConfirm(
      "Bạn có chắc chắn muốn TỪ CHỐI yêu cầu hoàn trả này?",
      async () => {
        setActionLoading((prev) => ({ ...prev, [orderId]: true }));
        try {
          const adminNote = adminNotes[orderId] || "";
          const res = await orderServices.rejectReturn(returnId, { adminNote });
          toast.success(res.message || "Từ chối hoàn trả thành công!", {
            position: "top-right",
          });
          setAdminNotes((prev) => {
            const c = { ...prev };
            delete c[orderId];
            return c;
          });
          setReturnDetails((prev) => {
            const c = { ...prev };
            delete c[orderId];
            return c;
          });
          setSelectedOrder(null);
          fetchOrders();
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Lỗi khi từ chối hoàn trả!",
            { position: "top-right" },
          );
        } finally {
          setActionLoading((prev) => ({ ...prev, [orderId]: false }));
        }
      },
      "primary",
      "Từ chối hoàn trả",
    );
  };

  const executeAction = async (orderId, actionName, serviceCall) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await serviceCall(orderId);
      toast.success(res.message || `${actionName} thành công!`, {
        position: "top-right",
      });
      fetchOrders();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Lỗi khi thực hiện: ${actionName}`,
        { position: "top-right" },
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirm = (order) => {
    const method = order.paymentMethodCode || "CASH";
    if (method !== "CASH" && order.paymentStatus !== "PAID") {
      toast.warning(
        "Đơn hàng thanh toán trực tuyến chưa hoàn tất thanh toán!",
        {
          position: "top-right",
        },
      );
      return;
    }
    executeAction(
      order.orderId,
      "Duyệt & Chuẩn bị đơn hàng",
      orderServices.confirmOrder,
    );
  };

  const handleShip = (orderId) => {
    executeAction(
      orderId,
      "Bàn giao đơn hàng cho vận chuyển",
      orderServices.shipOrder,
    );
  };

  const handleDeliver = (order) => {
    executeAction(
      order.orderId,
      "Hoàn thành giao đơn hàng",
      orderServices.deliverOrder,
    );
  };

  const handleCancel = (order) => {
    triggerConfirm(
      `Bạn có chắc chắn muốn hủy đơn hàng #${order.orderId}?`,
      () =>
        executeAction(order.orderId, "Hủy đơn hàng", orderServices.cancelOrder),
      "danger",
      "Hủy đơn hàng",
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders(1);
  };

  const handleReset = () => {
    setSearchOrderId("");
    setPaymentMethodCode("");
    setPriceRange("");
    setPage(1);

    setIsLoading(true);
    orderServices
      .getAllOrders(1, pageSize)
      .then((res) => {
        setOrders(res?.data?.items || []);
        setTotalPages(res?.data?.totalPage || 1);
      })
      .catch((err) => {
        console.error("Lỗi khi tải lại đơn hàng:", err);
        setOrders([]);
        setTotalPages(1);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((o) => o.orderStatus === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Đơn hàng"
        title="Quản lý đơn hàng"
        description="Theo dõi luồng vận hành, duyệt, giao hàng và hủy đơn hàng trên hệ thống."
      />

      {/* Bộ lọc & Tìm kiếm */}
      <OrderFilter
        searchOrderId={searchOrderId}
        setSearchOrderId={setSearchOrderId}
        paymentMethodCode={paymentMethodCode}
        setPaymentMethodCode={setPaymentMethodCode}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        paymentMethods={paymentMethods}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <OrderTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        orders={orders}
      />

      <OrderList
        orders={filteredOrders}
        isLoading={isLoading}
        actionLoading={actionLoading}
        onViewDetail={handleViewDetail}
        onConfirm={handleConfirm}
        onShip={handleShip}
        onDeliver={handleDeliver}
        onCancel={handleCancel}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          returnDetail={returnDetails[selectedOrder.orderId]}
          adminNote={adminNotes[selectedOrder.orderId]}
          onAdminNoteChange={(orderId, val) =>
            setAdminNotes((prev) => ({ ...prev, [orderId]: val }))
          }
          onApproveReturn={handleApproveReturn}
          onRejectReturn={handleRejectReturn}
          onConfirm={handleConfirm}
          onShip={handleShip}
          onDeliver={handleDeliver}
          onCancel={handleCancel}
          loading={actionLoading[selectedOrder.orderId]}
        />
      )}

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default OrdersPage;
