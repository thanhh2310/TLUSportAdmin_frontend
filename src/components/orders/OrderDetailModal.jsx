import React from "react";
import {
  X,
  User,
  MapPin,
  Receipt,
  Truck,
  ShoppingBag,
  CreditCard,
  Package,
} from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const StatusBadge = ({ status }) => {
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
  return <span className={`text-xs font-bold ${item.cls}`}>{item.label}</span>;
};

const PaymentStatusBadge = ({ status }) => {
  const map = {
    UNPAID: { label: "Chưa thanh toán", cls: "text-amber-600" },
    PAID: { label: "Đã thanh toán", cls: "text-emerald-600" },
    FAILED: { label: "TT thất bại", cls: "text-rose-600" },
    REFUNDED: { label: "Đã hoàn tiền", cls: "text-teal-600" },
  };
  const item = map[status] || { label: status, cls: "text-neutral-500" };
  return <span className={`text-xs font-bold ${item.cls}`}>{item.label}</span>;
};

const OrderDetailModal = ({
  order,
  onClose,
  returnDetail,
  adminNote,
  onAdminNoteChange,
  onApproveReturn,
  onRejectReturn,
  onConfirm,
  onShip,
  onDeliver,
  onCancel,
  loading,
}) => {
  if (!order) return null;

  const isPending = order.orderStatus === "PENDING";
  const isProcessing = order.orderStatus === "PROCESSING";
  const isShipped = order.orderStatus === "SHIPPED";
  const hasActions = isPending || isProcessing || isShipped;

  const totalItems = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Right drawer */}
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutral-200 gap-3">
          <div>
            <h2 className="text-lg font-black text-neutral-900">
              Chi tiết đơn #{String(order.orderId).padStart(6, "0")}
            </h2>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
            <StatusBadge status={order.orderStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
            <button
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-500 ml-1"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Items */}
          <section>
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="size-3" /> Mặt hàng ({totalItems})
            </h3>
            <div className="space-y-2.5">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-center p-3 rounded-2xl border border-neutral-200 bg-neutral-50/40"
                >
                  <img
                    src={
                      item.imageUrl ||
                      "https://placehold.co/60x60?text=No+Image"
                    }
                    alt={item.productName}
                    className="w-14 h-14 object-cover border border-neutral-200 rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-neutral-900 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      SKU: {item.skuCode || "N/A"}
                    </p>
                    {item.attributeValues?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.attributeValues.map((attr, aIdx) => (
                          <span
                            key={aIdx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-neutral-700 border border-neutral-200"
                          >
                            {attr.attributeName || attr.name}:{" "}
                            {attr.valueName || attr.value}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 mt-1.5 font-semibold">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-neutral-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment summary */}
          <section>
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Receipt className="size-3" /> Tổng thanh toán
            </h3>
            <div className="bg-neutral-50 rounded-2xl p-4 space-y-2.5 border border-neutral-200 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Tạm tính</span>
                <span className="font-extrabold text-neutral-800">
                  {formatCurrency(
                    order.subtotal ||
                      order.totalAmount -
                        (order.shippingFee || 0) +
                        (order.discountAmount || 0),
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold flex items-center gap-1">
                  <Truck className="size-3" /> Phí vận chuyển
                </span>
                <span className="font-extrabold text-neutral-800">
                  {order.shippingFee > 0
                    ? formatCurrency(order.shippingFee)
                    : "Miễn phí"}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-bold">
                    Giảm giá {order.couponCode ? `(${order.couponCode})` : ""}
                  </span>
                  <span className="font-extrabold text-emerald-600">
                    − {formatCurrency(order.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold flex items-center gap-1">
                  <CreditCard className="size-3" /> Phương thức
                </span>
                <span className="font-extrabold text-neutral-800">
                  {order.paymentMethodName || order.paymentMethodCode}
                </span>
              </div>
              {order.paymentTransactionId && (
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 font-bold">Mã GD</span>
                  <span
                    className="font-mono text-neutral-600 truncate max-w-[180px] font-bold"
                    title={order.paymentTransactionId}
                  >
                    {order.paymentTransactionId}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2.5 border-t border-neutral-200">
                <span className="text-neutral-700 font-bold">
                  Tổng thanh toán
                </span>
                <span className="text-xl font-black text-neutral-900">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Customer & Shipping */}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="size-3" /> Người đặt hàng
              </h3>
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-1.5 text-xs">
                <p className="font-bold text-neutral-900">
                  {order.buyerName || "N/A"}
                </p>
                <p className="text-neutral-500 font-semibold">
                  {order.buyerPhone || "Chưa cập nhật"}
                </p>
                <p className="text-neutral-500 font-semibold truncate">
                  {order.buyerEmail || "Chưa cập nhật"}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="size-3" /> Giao hàng
              </h3>
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-1.5 text-xs">
                <p className="font-bold text-neutral-900">
                  {order.shippingMethodName || "N/A"}
                </p>
                <p className="text-neutral-500 font-semibold">
                  {order.shippingAddress || "Chưa cập nhật"}
                </p>
                <p className="text-neutral-500 font-semibold">
                  {order.shippingCity || ""}
                </p>
              </div>
            </div>
          </section>

          {/* Return info */}
          {returnDetail && (
            <section>
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShoppingBag className="size-3" /> Yêu cầu hoàn trả
              </h3>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-500 font-bold mb-0.5">Lý do:</p>
                    <p className="text-neutral-800 font-semibold">
                      {returnDetail.reason}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500 font-bold mb-0.5">
                      Số tiền hoàn:
                    </p>
                    <p className="text-rose-600 font-black text-sm">
                      {formatCurrency(returnDetail.refundAmount)}
                    </p>
                  </div>
                </div>
                <p className="text-neutral-400 font-medium">
                  Ngày yêu cầu:{" "}
                  {new Date(returnDetail.createdAt).toLocaleString("vi-VN")}
                </p>

                {order.orderStatus === "RETURN_REQUESTED" ? (
                  <div className="border-t border-orange-200 pt-3 space-y-2.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase">
                      Ghi chú phản hồi (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập lý do đồng ý / từ chối..."
                      value={adminNote || ""}
                      onChange={(e) =>
                        onAdminNoteChange(order.orderId, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl outline-none focus:border-neutral-900 text-xs bg-white"
                      disabled={loading}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onApproveReturn(order.orderId, returnDetail.id)
                        }
                        disabled={loading}
                        className="flex-1 py-2 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Chấp nhận hoàn tiền
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onRejectReturn(order.orderId, returnDetail.id)
                        }
                        disabled={loading}
                        className="flex-1 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Từ chối hoàn hàng
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-orange-200 pt-3 space-y-1">
                    <p className="text-neutral-500 font-semibold">
                      Ghi chú:{" "}
                      <span className="text-neutral-800 font-bold">
                        {returnDetail.adminNote || "Không có"}
                      </span>
                    </p>
                    {returnDetail.processedByName && (
                      <p className="text-neutral-400 font-medium">
                        Người duyệt: {returnDetail.processedByName} (
                        {new Date(returnDetail.processedAt).toLocaleString(
                          "vi-VN",
                        )}
                        )
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sticky action footer */}
        {hasActions && (
          <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-2.5 bg-white shrink-0">
            {(isPending || isProcessing) && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 font-bold text-sm hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy đơn hàng
              </button>
            )}
            {isPending && (
              <button
                type="button"
                onClick={() => onConfirm(order)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-sm hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Duyệt & Đóng gói"}
              </button>
            )}
            {isProcessing && (
              <button
                type="button"
                onClick={() => onShip(order.orderId)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-sm hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Bàn giao vận chuyển"}
              </button>
            )}
            {isShipped && (
              <button
                type="button"
                onClick={() => onDeliver(order)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Xác nhận đã giao"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;
