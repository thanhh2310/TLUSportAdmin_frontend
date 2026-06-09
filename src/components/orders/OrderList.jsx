import React from "react";
import { Loader2 } from "lucide-react";
import { getPaginationRange } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";

const OrderStatusBadge = ({ status }) => {
  const map = {
    PENDING: { label: "Chờ xác nhận", cls: "text-amber-600" },
    PROCESSING: { label: "Đang chuẩn bị", cls: "text-blue-600" },
    SHIPPED: { label: "Đang giao hàng", cls: "text-indigo-600" },
    DELIVERED: { label: "Đã hoàn thành", cls: "text-emerald-600" },
    CANCELLED: { label: "Đã hủy", cls: "text-rose-600" },
    RETURN_REQUESTED: { label: "Yêu cầu hoàn trả", cls: "text-orange-600" },
    RETURNED: { label: "Đã hoàn trả", cls: "text-teal-600" },
    RETURN_REJECTED: { label: "Từ chối hoàn trả", cls: "text-neutral-500" },
  };
  const item = map[status] || { label: status, cls: "text-neutral-500" };
  return (
    <span className={`text-[11px] font-bold whitespace-nowrap ${item.cls}`}>
      {item.label}
    </span>
  );
};

const PaymentMethodCell = ({ code, name }) => {
  const labels = {
    VNPAY: "VNPay",
    CASH: "COD",
    COD: "COD",
    WALLET: "Ví điện tử",
  };
  const label = labels[code?.toUpperCase()] || name || code || "N/A";
  return <span className="text-xs font-bold text-neutral-700">{label}</span>;
};

const OrderList = ({
  orders,
  isLoading,
  actionLoading,
  onViewDetail,
  onConfirm,
  onShip,
  onDeliver,
  onCancel,
  page,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="w-full text-center py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-neutral-200 shadow-sm">
        <Loader2 className="animate-spin text-neutral-500 size-8" />
        <span className="text-neutral-500 font-bold">
          Đang tải danh sách đơn hàng...
        </span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-16 text-center shadow-sm">
        <h3 className="text-xl font-black text-neutral-900">
          Không tìm thấy đơn hàng nào
        </h3>
        <p className="mt-2 text-sm font-medium text-neutral-500">
          Không có dữ liệu đơn hàng nào tương ứng với trạng thái bộ lọc đã chọn.
        </p>
      </div>
    );
  }

  const PAGE_SIZE = 10;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              <th className="px-5 py-4 text-center w-12">STT</th>
              <th className="px-5 py-4">Mã đơn hàng</th>
              <th className="px-5 py-4">Khách hàng</th>
              <th className="px-5 py-4 whitespace-nowrap">Ngày đặt</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 whitespace-nowrap">Phương thức TT</th>
              <th className="px-5 py-4 text-right whitespace-nowrap">
                Giá trị đơn hàng
              </th>
              <th className="px-5 py-4">Hành động</th>
              <th className="px-5 py-4 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {orders.map((order, idx) => {
              const isPending = order.orderStatus === "PENDING";
              const isProcessing = order.orderStatus === "PROCESSING";
              const isShipped = order.orderStatus === "SHIPPED";
              const isActive = isPending || isProcessing || isShipped;
              const loading = actionLoading[order.orderId];
              const globalIdx = (page - 1) * PAGE_SIZE + idx;

              return (
                <tr
                  key={order.orderId}
                  className="hover:bg-neutral-50/60 transition-colors"
                >
                  {/* STT */}
                  <td className="px-5 py-3.5 text-center font-bold text-neutral-400 text-xs">
                    {globalIdx + 1}
                  </td>

                  {/* Mã đơn hàng */}
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-blue-600 text-sm whitespace-nowrap">
                      #{String(order.orderId).padStart(6, "0")}
                    </span>
                  </td>

                  {/* Khách hàng */}
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-neutral-900 text-sm whitespace-nowrap">
                      {order.buyerName || "N/A"}
                    </p>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {order.buyerPhone || ""}
                    </p>
                  </td>

                  {/* Ngày đặt */}
                  <td className="px-5 py-3.5 text-xs font-bold text-neutral-600 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  {/* Trạng thái */}
                  <td className="px-5 py-3.5">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>

                  {/* Phương thức TT */}
                  <td className="px-5 py-3.5">
                    <PaymentMethodCell
                      code={order.paymentMethodCode}
                      name={order.paymentMethodName}
                    />
                  </td>

                  {/* Giá trị */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span
                      className={`font-extrabold text-sm ${
                        order.orderStatus === "CANCELLED"
                          ? "text-rose-500"
                          : "text-neutral-900"
                      }`}
                    >
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </td>

                  {/* Hành động */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <>
                          <button
                            onClick={() => onConfirm(order)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg bg-neutral-950 text-white font-bold text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                          >
                            {loading ? "..." : "Duyệt đơn"}
                          </button>
                          <button
                            onClick={() => onCancel(order)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 font-bold text-[11px] hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                      {isProcessing && (
                        <>
                          <button
                            onClick={() => onShip(order.orderId)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg bg-neutral-950 text-white font-bold text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                          >
                            {loading ? "..." : "Bàn giao"}
                          </button>
                          <button
                            onClick={() => onCancel(order)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 font-bold text-[11px] hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                      {isShipped && (
                        <button
                          onClick={() => onDeliver(order)}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        >
                          {loading ? "..." : "Xác nhận giao"}
                        </button>
                      )}
                      {!isActive && (
                        <span className="text-neutral-300 text-sm select-none">
                          —
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Chi tiết */}
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-bold text-xs hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-4">
          <span className="text-xs font-bold text-neutral-500">
            Trang {page} / {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Trang trước
            </button>

            {getPaginationRange(page, totalPages).map((p, idx) =>
              p === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-neutral-400 select-none font-bold"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                    p === page
                      ? "bg-neutral-950 text-white border-neutral-950"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(Math.min(page + 1, totalPages))}
              className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
