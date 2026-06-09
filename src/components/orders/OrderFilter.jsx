import React from "react";

export const PRICE_RANGES = [
  { label: "Tất cả khoảng giá", value: "" },
  { label: "Dưới 500,000 đ", value: "UNDER_500K", min: 0, max: 500000 },
  { label: "500,000 đ - 1,000,000 đ", value: "500K_1M", min: 500000, max: 1000000 },
  { label: "1,000,000 đ - 5,000,000 đ", value: "1M_5M", min: 1000000, max: 5000000 },
  { label: "Trên 5,000,000 đ", value: "ABOVE_5M", min: 5000000, max: 999999999 },
];

const OrderFilter = ({
  searchOrderId,
  setSearchOrderId,
  paymentMethodCode,
  setPaymentMethodCode,
  priceRange,
  setPriceRange,
  paymentMethods,
  onSearch,
  onReset,
}) => {
  return (
    <form
      onSubmit={onSearch}
      className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4"
    >
      <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
        Bộ lọc & Tìm kiếm
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Mã đơn hàng */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500">Mã đơn hàng</label>
          <input
            type="text"
            placeholder="VD: 000123 hoặc 123"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-neutral-900 text-xs bg-white"
          />
        </div>

        {/* Phương thức thanh toán */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500">
            Phương thức thanh toán
          </label>
          <select
            value={paymentMethodCode}
            onChange={(e) => setPaymentMethodCode(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-neutral-950 text-xs bg-white"
          >
            <option value="">Tất cả</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.code}>
                {method.name} ({method.code})
              </option>
            ))}
          </select>
        </div>

        {/* Khoảng giá */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-neutral-500">
            Khoảng giá trị đơn hàng
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-neutral-950 text-xs bg-white w-full"
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 border border-neutral-300 rounded-xl bg-white text-neutral-700 font-bold text-xs hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
        >
          Xóa bộ lọc
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-950 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
};

export default OrderFilter;
