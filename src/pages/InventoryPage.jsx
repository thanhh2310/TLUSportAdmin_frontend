import React, { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import productServices from "@/services/productServices";
import skuServices from "@/services/skuServices";
import attributeServices from "@/services/attributeServices";
import { toast } from "sonner";
import { getPaginationRange } from "@/lib/utils";

import {
  Search,
  ChevronDown,
  ChevronUp,
  Edit3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Boxes,
  Loader2,
  X,
  SlidersHorizontal,
} from "lucide-react";

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Modal State
  const [selectedSku, setSelectedSku] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Attribute filters
  const [sizes, setSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // Filter sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Debounce keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      if (keyword.trim()) {
        setFilterType("ALL");
        setSelectedSizes([]);
        setSelectedColors([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Fetch size and color attributes
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await attributeServices.getAttributes();
        if (res && res.data) {
          const sizeAttr = res.data.find(
            (attr) =>
              attr.id === 2 || attr.name?.toLowerCase() === "kích thước",
          );
          if (sizeAttr && sizeAttr.values) {
            const sizeOrder = [
              "XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL",
            ];
            const sortedSizes = [...sizeAttr.values].sort((a, b) => {
              const idxA = sizeOrder.indexOf(a.value?.toUpperCase());
              const idxB = sizeOrder.indexOf(b.value?.toUpperCase());
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              const numA = parseFloat(a.value);
              const numB = parseFloat(b.value);
              if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
              return a.value.localeCompare(b.value);
            });
            setSizes(sortedSizes);
          }

          const colorAttr = res.data.find(
            (attr) =>
              attr.id === 3 || attr.name?.toLowerCase() === "màu sắc",
          );
          if (colorAttr && colorAttr.values) {
            setColors(colorAttr.values);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải thuộc tính:", error);
      }
    };
    fetchAttributes();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let res;
      const combinedIds = [...selectedSizes, ...selectedColors];
      if (debouncedKeyword.trim()) {
        res = await productServices.searchProducts(
          debouncedKeyword.trim(),
          page,
          pageSize,
        );
      } else if (filterType !== "ALL" || combinedIds.length > 0) {
        res = await productServices.filterProducts({
          stockFilter: filterType !== "ALL" ? filterType : undefined,
          attributeValueIds: combinedIds.length > 0 ? combinedIds : undefined,
          pageNumber: page,
          pageSize: pageSize,
        });
      } else {
        res = await productServices.getProducts(page, pageSize);
      }

      if (res && res.data) {
        const items = res.data.items || res.data || [];
        setProducts(items);
        setTotalPages(res.data.totalPage || 1);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, filterType, selectedSizes, selectedColors]);

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedKeyword, filterType, selectedSizes, selectedColors]);

  const handleSizeToggle = (sizeId) => {
    setKeyword("");
    setDebouncedKeyword("");
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId],
    );
  };

  const handleColorToggle = (colorId) => {
    setKeyword("");
    setDebouncedKeyword("");
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId],
    );
  };

  const handleFilterTypeChange = (type) => {
    setKeyword("");
    setDebouncedKeyword("");
    setFilterType(type);
    if (type !== "OUT_OF_STOCK") {
      setSelectedSizes([]);
      setSelectedColors([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const toggleExpand = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const openUpdateModal = (productId, sku) => {
    setSelectedProductId(productId);
    setSelectedSku(sku);
    setNewStock(sku.stockQuantity);
    setNote("");
  };

  const closeUpdateModal = () => {
    setSelectedSku(null);
    setSelectedProductId(null);
    setNewStock("");
    setNote("");
  };

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (newStock === "" || isNaN(newStock) || Number(newStock) < 0) {
      toast.error("Vui lòng nhập số lượng tồn kho hợp lệ (>= 0)");
      return;
    }

    setIsUpdating(true);
    try {
      await skuServices.updateStock(selectedProductId, selectedSku.id, {
        stockQuantity: Number(newStock),
        note: note,
      });
      toast.success("Cập nhật số lượng tồn kho thành công!");
      closeUpdateModal();
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật tồn kho.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return {
        label: "Hết hàng",
        color: "text-rose-700 bg-rose-50 border-rose-200",
        icon: XCircle,
      };
    }
    if (quantity <= 10) {
      return {
        label: "Tồn kho thấp",
        color: "text-amber-700 bg-amber-50 border-amber-200",
        icon: AlertTriangle,
      };
    }
    return {
      label: "Còn hàng",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: CheckCircle,
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredProducts = products;
  const activeFilterCount = selectedSizes.length + selectedColors.length;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Kho hàng"
        title="Quản lý tồn kho"
        description="Theo dõi trạng thái tồn kho của các biến thể sản phẩm, cập nhật số lượng tồn kho nhanh chóng."
      />

      {/* Search + Tab Filters */}
      <div className="bg-white px-6 py-4 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 min-w-[280px] max-w-md"
          >
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-300 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 size-5" />
          </form>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "IN_STOCK", label: "Còn hàng (>10)" },
              { id: "LOW_STOCK", label: "Tồn kho thấp (≤10)" },
              { id: "OUT_OF_STOCK", label: "Hết hàng (0)" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleFilterTypeChange(opt.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  filterType === opt.id
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Filter Sidebar + Product List */}
      <div className="flex gap-4 items-start">

        {/* Collapsible Filter Sidebar — only on OUT_OF_STOCK tab */}
        {filterType === "OUT_OF_STOCK" && (
          <div className="shrink-0 w-52">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden sticky top-4">
              {/* Header toggle */}
              <button
                type="button"
                onClick={() => setIsFilterOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-3.5 text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-700">Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-neutral-950 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {isFilterOpen ? (
                  <ChevronUp className="size-3.5 text-neutral-400" />
                ) : (
                  <ChevronDown className="size-3.5 text-neutral-400" />
                )}
              </button>

              {/* Filter content */}
              {isFilterOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-neutral-100">
                  {/* Size filter */}
                  {sizes.length > 0 && (
                    <div className="pt-3">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Kích thước
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sizes.map((size) => (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => handleSizeToggle(size.id)}
                            className={`px-2 py-0.5 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                              selectedSizes.includes(size.id)
                                ? "bg-neutral-950 text-white border-neutral-950 shadow-sm"
                                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                          >
                            {size.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color filter */}
                  {colors.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Màu sắc
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => {
                          const isSelected = selectedColors.includes(color.id);
                          const colorCode = color.description || "#aaa";
                          return (
                            <div
                              key={color.id}
                              onClick={() => handleColorToggle(color.id)}
                              title={color.value}
                              className={`w-7 h-5 rounded-full cursor-pointer transition-all ${
                                isSelected
                                  ? "ring-2 ring-offset-1 ring-neutral-900 scale-110"
                                  : "ring-1 ring-neutral-200 hover:scale-105"
                              }`}
                              style={{ backgroundColor: colorCode }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Clear filters */}
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSizes([]);
                        setSelectedColors([]);
                      }}
                      className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 underline transition-colors cursor-pointer"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="w-full text-center py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-neutral-500 size-8" />
              <span className="text-neutral-500 font-bold">
                Đang tải danh sách tồn kho...
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-16 text-center shadow-sm">
              <h3 className="text-xl font-black text-neutral-900">
                Không tìm thấy sản phẩm nào
              </h3>
              <p className="mt-2 text-sm font-medium text-neutral-500">
                Không có dữ liệu tồn kho nào tương ứng với tìm kiếm hoặc bộ lọc của bạn.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      <th className="px-6 py-4 w-12"></th>
                      <th className="px-6 py-4">Sản phẩm</th>
                      <th className="px-6 py-4">Danh mục</th>
                      <th className="px-6 py-4">Số biến thể</th>
                      <th className="px-6 py-4">Tổng tồn kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {filteredProducts.map((product) => {
                      const isExpanded = !!expandedProducts[product.id];
                      const totalStock =
                        product.skus?.reduce(
                          (sum, s) => sum + (s.stockQuantity || 0),
                          0,
                        ) || 0;
                      const skuCount = product.skus?.length || 0;

                      return (
                        <React.Fragment key={product.id}>
                          {/* Product Header Row */}
                          <tr
                            className="hover:bg-neutral-50/50 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(product.id)}
                          >
                            <td className="px-6 py-4 text-center">
                              {isExpanded ? (
                                <ChevronUp className="size-5 text-neutral-500" />
                              ) : (
                                <ChevronDown className="size-5 text-neutral-500" />
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    product?.skus?.[0]?.images?.[0]?.imageUrl ||
                                    "https://placehold.co/60x60?text=No+Image"
                                  }
                                  alt={product.name}
                                  className="size-10 object-cover border border-neutral-200 rounded-xl"
                                />
                                <div>
                                  <span className="font-extrabold text-neutral-900 block line-clamp-1">
                                    {product.name}
                                  </span>
                                  <span className="text-xs text-neutral-400 font-medium">
                                    ID: #{product.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-neutral-700">
                              {product.categoryName || "Chưa phân loại"}
                            </td>
                            <td className="px-6 py-4 font-extrabold text-neutral-800">
                              {skuCount} biến thể
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  totalStock === 0
                                    ? "bg-rose-50 text-rose-700"
                                    : totalStock <= 10
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {totalStock} sản phẩm
                              </span>
                            </td>
                          </tr>

                          {/* Expanded SKU List Row */}
                          {isExpanded && (
                            <tr>
                              <td
                                colSpan="6"
                                className="bg-neutral-50/70 px-8 py-4"
                              >
                                <div className="rounded-2xl border border-neutral-200 bg-white shadow-inner overflow-hidden">
                                  <table className="w-full border-collapse text-left text-xs">
                                    <thead>
                                      <tr className="bg-neutral-100/50 border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                        <th className="px-6 py-3">Mã SKU</th>
                                        <th className="px-6 py-3">Thuộc tính</th>
                                        <th className="px-6 py-3">Giá bán</th>
                                        <th className="px-6 py-3">Số lượng tồn</th>
                                        <th className="px-6 py-3">Trạng thái</th>
                                        <th className="px-6 py-3 w-28 text-center">
                                          Tác vụ
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-xs">
                                      {!product.skus ||
                                      product.skus.length === 0 ? (
                                        <tr>
                                          <td
                                            colSpan="6"
                                            className="px-6 py-4 text-center text-neutral-400 font-bold"
                                          >
                                            Không có biến thể (SKU) nào cho sản phẩm này.
                                          </td>
                                        </tr>
                                      ) : (
                                        product.skus.map((sku) => {
                                          const status = getStockStatus(
                                            sku.stockQuantity || 0,
                                          );
                                          const StatusIcon = status.icon;

                                          return (
                                            <tr
                                              key={sku.id}
                                              className="hover:bg-neutral-50/30"
                                            >
                                              <td className="px-6 py-3 font-mono font-extrabold text-neutral-700">
                                                {sku.skuCode}
                                              </td>
                                              <td className="px-6 py-3 font-bold text-neutral-600">
                                                {sku.attributeValues &&
                                                sku.attributeValues.length > 0
                                                  ? sku.attributeValues
                                                      .map(
                                                        (attr) =>
                                                          `${attr.attributeName}: ${attr.valueName}`,
                                                      )
                                                      .join(" | ")
                                                  : "Mặc định"}
                                              </td>
                                              <td className="px-6 py-3 font-extrabold text-neutral-800">
                                                {formatCurrency(sku.price)}
                                              </td>
                                              <td className="px-6 py-3 font-black text-sm text-neutral-900">
                                                {sku.stockQuantity}
                                              </td>
                                              <td className="px-6 py-3">
                                                <span
                                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}
                                                >
                                                  <StatusIcon className="size-3" />
                                                  {status.label}
                                                </span>
                                              </td>
                                              <td className="px-6 py-3 text-center">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    openUpdateModal(product.id, sku)
                                                  }
                                                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 font-bold hover:bg-neutral-50 active:bg-neutral-100 shadow-sm cursor-pointer text-neutral-700"
                                                >
                                                  <Edit3 className="size-3.5" />
                                                  Sửa tồn
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Trang trước
                    </button>

                    {getPaginationRange(page, totalPages).map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span
                            key={`dots-${idx}`}
                            className="w-8 h-8 flex items-center justify-center text-neutral-400 select-none font-bold"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                            p === page
                              ? "bg-neutral-950 text-white border-neutral-950"
                              : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Stock Modal */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl relative">
            <button
              onClick={closeUpdateModal}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 size-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Boxes className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  Cập nhật tồn kho
                </h3>
                <span className="text-xs font-mono font-bold text-neutral-400">
                  SKU: {selectedSku.skuCode}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Số lượng tồn kho mới
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-bold"
                  placeholder="Ví dụ: 50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Ghi chú điều chỉnh (Không bắt buộc)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-medium h-20 resize-none"
                  placeholder="Ví dụ: Kiểm kho định kỳ tháng 5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="flex-1 rounded-2xl border border-neutral-300 bg-white py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 rounded-2xl bg-neutral-950 py-2.5 text-sm font-black text-white hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="animate-spin size-4" />
                      Đang lưu...
                    </>
                  ) : (
                    "Xác nhận lưu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
