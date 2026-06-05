import { useState, useEffect } from "react";
import { Pencil, Trash2, Search, X } from "lucide-react";
import FormSection from "@/components/common/FormSection";
import { formatCurrency } from "@/lib/formatCurrency";
import { getPaginationRange } from "@/lib/utils";

const ProductListPanel = ({ products, pageNumber, totalPages = 1, setPage, onEdit, onDelete, onPrevPage, onNextPage, onSearch }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="sticky top-23 h-fit">
      <FormSection title="Danh sách sản phẩm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-9 text-sm font-medium placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {products.length === 0 && (
            <p className="rounded-2xl bg-neutral-50 p-4 text-sm font-medium text-neutral-500">
              Chưa có dữ liệu mẫu.
            </p>
          )}
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-neutral-200 p-4 transition-colors hover:border-neutral-300"
            >
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">{product.name}</p>
                  <p className="mt-1 text-sm font-bold text-blue-700">
                    {formatCurrency(product.basePrice)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-neutral-400">
                    {product.categoryName || `Category ID: ${product.categoryId || "N/A"}`}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="admin-icon-button text-blue-600 hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="admin-icon-button text-red-500 hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 bg-white">
            <span className="text-xs font-bold text-neutral-500">
              Trang {pageNumber} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pageNumber === 1}
                onClick={() => setPage?.((p) => Math.max(p - 1, 1)) || onPrevPage?.()}
                className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Trang trước
              </button>

              {getPaginationRange(pageNumber, totalPages).map((p, idx) => {
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
                    type="button"
                    onClick={() => setPage?.(p)}
                    className={`w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                      p === pageNumber
                        ? "bg-neutral-950 text-white border-neutral-950"
                        : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={pageNumber === totalPages}
                onClick={() => setPage?.((p) => Math.min(p + 1, totalPages)) || onNextPage?.()}
                className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </FormSection>
    </div>
  );
};

export default ProductListPanel;
