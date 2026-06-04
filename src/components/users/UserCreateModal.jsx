import React from "react";
import { X, UserPlus, Loader2 } from "lucide-react";

const ROLE_OPTIONS = [
  { id: "ROLE_USER", label: "Khách hàng" },
  { id: "ROLE_STAFF", label: "Nhân viên" },
  { id: "ROLE_ADMIN", label: "Admin" },
];

const UserCreateModal = ({ isOpen, onClose, formData, onChange, onRoleChange, onSubmit, actionLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 size-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X size={16} />
        </button>

        <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
          <UserPlus className="text-blue-600" />
          Thêm tài khoản mới
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Họ</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={onChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
                placeholder="Nguyễn"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Tên</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={onChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
                placeholder="An"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={onChange}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={onChange}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
            <input
              type="tel"
              name="phoneNumber"
              required
              pattern="^\d{10,11}$"
              value={formData.phoneNumber}
              onChange={onChange}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 text-sm font-semibold"
              placeholder="Ví dụ: 0987654321"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Vai trò hệ thống</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((roleOpt) => (
                <button
                  type="button"
                  key={roleOpt.id}
                  onClick={() => onRoleChange(roleOpt.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.roles.includes(roleOpt.id)
                      ? "bg-neutral-950 border-neutral-950 text-white"
                      : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {roleOpt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={onChange}
                className="size-4 rounded accent-neutral-950 cursor-pointer"
              />
              <span className="text-xs font-bold text-neutral-700 select-none">
                Kích hoạt tài khoản ngay khi tạo
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-neutral-300 bg-white py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 rounded-2xl bg-neutral-950 py-2.5 text-sm font-black text-white hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="animate-spin size-4" />
                  Đang tạo...
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateModal;
