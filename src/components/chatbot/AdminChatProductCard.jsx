import React, { useState, useEffect } from "react";
import productServices from "@/services/productServices";

const AdminChatProductCard = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productServices.getProductById(productId);
        if (res && res.data) {
          setProduct(res.data);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="w-[140px] h-[190px] bg-neutral-200 animate-pulse rounded-2xl shrink-0" />
    );
  }

  if (!product) return null;

  const imageUrl = product.skus?.[0]?.images?.[0]?.imageUrl || "https://placehold.co/400x400?text=No+Image";

  return (
    <div className="flex flex-col gap-1 w-[140px] bg-white border border-neutral-100 rounded-2xl p-2 shrink-0 shadow-sm transition-transform duration-300 hover:scale-102">
      <div className="aspect-square overflow-hidden rounded-xl bg-neutral-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h4 className="text-[11px] font-bold text-neutral-800 line-clamp-2 leading-tight mt-1">
        {product.name}
      </h4>
      <p className="text-[11px] font-black text-blue-600 mt-0.5">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.base_price || 0)}
      </p>
    </div>
  );
};

export default AdminChatProductCard;
