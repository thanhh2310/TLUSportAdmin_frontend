import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { getPaginationRange } from "@/lib/utils";
import PageHeader from "@/components/common/PageHeader";
import FormSection from "@/components/common/FormSection";
import Field from "@/components/common/Field";
import SubmitButton from "@/components/common/SubmitButton";
import ImageUpload from "@/components/common/ImageUpload";
import bannerServices from "@/services/bannerServices";

const initialForm = {
  title: "",
  imageUrl: "",
  targetUrl: "",
  displayOrder: 0,
  isActive: true,
};

const BannersPage = () => {
  const [form, setForm] = useState(initialForm);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const res = await bannerServices.getAllBanners({ page, size: pageSize });
      if (res && res.data) {
        setBanners(res.data.items || []);
        setTotalPages(res.data.totalPage || 1);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách banner:", error);
      toast.error("Không thể tải danh sách banner từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [page]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleEdit = (banner) => {
    setEditId(banner.id);
    setForm({
      title: banner.title || "",
      imageUrl: banner.imageUrl || "",
      targetUrl: banner.targetUrl || "",
      displayOrder: banner.displayOrder !== undefined ? banner.displayOrder : 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(initialForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) return;

    try {
      const res = await bannerServices.deleteBanner(id);
      toast.success(res.message || "Xóa banner thành công!");
      if (editId === id) handleCancelEdit();
      loadBanners();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể xóa banner.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.imageUrl) {
      toast.error("Vui lòng tải ảnh banner lên.");
      return;
    }

    setActionLoading(true);
    const payload = {
      ...form,
      position: "HOME_MAIN",
    };

    try {
      if (editId) {
        const originalBanner = banners.find((b) => b.id === editId);
        if (
          originalBanner &&
          originalBanner.displayOrder !== form.displayOrder
        ) {
          const conflictBanner = banners.find(
            (b) => b.displayOrder === form.displayOrder && b.id !== editId,
          );
          if (conflictBanner) {
            // Swap displayOrder with conflicting banner
            await bannerServices.updateBanner(conflictBanner.id, {
              title: conflictBanner.title,
              imageUrl: conflictBanner.imageUrl,
              position: conflictBanner.position || "HOME_MAIN",
              displayOrder: originalBanner.displayOrder,
              isActive: conflictBanner.isActive,
              targetUrl: conflictBanner.targetUrl || null,
            });
            toast.info(
              `Đã tự động đổi vị trí với banner "${conflictBanner.title}"`,
            );
          }
        }

        const res = await bannerServices.updateBanner(editId, payload);
        toast.success(res.message || "Cập nhật banner thành công!");
        setEditId(null);
      } else {
        const res = await bannerServices.createBanner(payload);
        toast.success(res.message || "Tạo banner thành công!");
      }
      setForm(initialForm);
      loadBanners();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          (editId ? "Không thể cập nhật banner." : "Không thể tạo banner mới."),
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Banners"
        title="Quản lý Banner"
        description="Quản lý danh sách hình ảnh banner hiển thị ở đầu trang chủ website, liên kết click và thứ tự hiển thị."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Form panel */}
        <FormSection title={editId ? "Cập nhật banner" : "Tạo banner mới"}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Tiêu đề banner">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
                placeholder="Ví dụ: Siêu sale mùa hè"
                required
              />
            </Field>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-neutral-700">
                Ảnh banner
              </label>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>

            <Field label="Đường dẫn liên kết (Target URL)">
              <input
                type="text"
                name="targetUrl"
                value={form.targetUrl}
                onChange={handleChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
                placeholder="https://..."
              />
            </Field>

            <Field label="Thứ tự hiển thị">
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
                placeholder="Số nhỏ hơn sẽ hiển thị trước"
                min="0"
                required
              />
            </Field>

            <label className="flex w-max cursor-pointer items-center gap-3 rounded-2xl bg-neutral-50 p-4 text-sm font-bold transition-colors hover:bg-neutral-100">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="size-4 rounded accent-neutral-950 cursor-pointer"
              />
              <span className="text-neutral-700 select-none">
                Trạng thái:{" "}
                {form.isActive ? "Đang bật (Hiển thị)" : "Đã tắt (Ẩn)"}
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full border border-neutral-350 bg-white px-6 py-2.5 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
              )}
              <SubmitButton isLoading={actionLoading}>
                {editId ? "Lưu thay đổi" : "Tạo banner"}
              </SubmitButton>
            </div>
          </form>
        </FormSection>

        {/* Display list panel */}
        <FormSection title="Danh sách banner">
          {isLoading ? (
            <div className="w-full text-center py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-neutral-500 size-8" />
              <span className="text-neutral-500 font-bold">
                Đang tải danh sách banner...
              </span>
            </div>
          ) : banners.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <h3 className="text-lg font-black text-neutral-900">
                Chưa có banner nào
              </h3>
              <p className="mt-2 text-sm font-medium text-neutral-500">
                Vui lòng điền thông tin bên cột trái để tạo banner đầu tiên.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md flex flex-col"
                  >
                    {/* Banner Image Preview */}
                    <div className="relative aspect-21/9 w-full overflow-hidden bg-neutral-100 border-b border-neutral-150">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-3 top-3 flex gap-2">
                        {banner.isActive ? (
                          <span className="rounded-full bg-neutral-950 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            Hiển thị
                          </span>
                        ) : (
                          <span className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Ẩn
                          </span>
                        )}
                        <span className="rounded-full bg-white border border-neutral-350 px-2 py-0.5 text-[10px] font-black text-neutral-950">
                          Thứ tự: {banner.displayOrder}
                        </span>
                      </div>
                    </div>

                    {/* Banner details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-neutral-950 line-clamp-1">
                          {banner.title}
                        </h4>
                        {banner.targetUrl ? (
                          <a
                            href={banner.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-neutral-450 hover:text-neutral-900 transition-colors"
                          >
                            <Link2 size={12} className="shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {banner.targetUrl}
                            </span>
                          </a>
                        ) : (
                          <span className="mt-1 text-xs italic font-medium text-neutral-350 block">
                            Không có liên kết
                          </span>
                        )}
                      </div>

                      {/* Card actions */}
                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(banner)}
                          className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-950 shadow-sm transition-colors cursor-pointer"
                          title="Chỉnh sửa banner"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(banner.id)}
                          className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-950 shadow-sm transition-colors cursor-pointer"
                          title="Xóa banner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-neutral-200 pt-4 bg-white">
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
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      className="rounded-full border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </FormSection>
      </div>
    </div>
  );
};

export default BannersPage;
