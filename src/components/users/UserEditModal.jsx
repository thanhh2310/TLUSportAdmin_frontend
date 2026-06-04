import React from "react";
import { X, Edit3, Loader2 } from "lucide-react";

const ROLE_OPTIONS = [
  { id: "ROLE_USER", label: "Khách hàng" },
  { id: "ROLE_STAFF", label: "Nhân viên" },
  { id: "ROLE_ADMIN", label: "Admin" },
];

const UserEditModal = ({ isOpen, onClose, selectedUser, formData, onChange, onRoleChange, onSubmit, actionLoading }) => {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 size-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X size={16} />
        </button>

        <h3 className="text-xl font-black text-neutral-900 mb-2 flex items-center gap-2">
          <Edit3 className="text-blue-600" />
          Sửa tài khoản
        </h3>
        <p className="text-xs font-mono font-bold text-neutral-400 mb-6">{selectedUser.email}</p>

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

          <div className="flex gap-3 pt-4">
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
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
