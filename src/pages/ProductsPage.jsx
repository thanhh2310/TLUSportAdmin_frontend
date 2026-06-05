import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import FormSection from "@/components/common/FormSection";
import SubmitButton from "@/components/common/SubmitButton";
import { slugify } from "@/lib/utils";
import productServices from "@/services/productServices";
import attributeServices from "@/services/attributeServices";
import categoryServices from "@/services/categoryServices";
import skuServices from "@/services/skuServices";
// Sub-components
import ProductFormInfo from "@/components/products/ProductFormInfo";
import ProductSpecsSection from "@/components/products/ProductSpecsSection";
import ProductSkusSection from "@/components/products/ProductSkusSection";
import ProductListPanel from "@/components/products/ProductListPanel";

// ─── Default shapes ───────────────────────────────────────────────────────────
const emptySpec = { attributeId: "", attributeValueId: "" };
const emptySku = {
  skuCode: "",
  price: "",
  stockQuantity: "",
  isActive: true,
  imageUrls: [],
  attributes: [
    { attributeId: "2", valueId: "" },
    { attributeId: "3", valueId: "" },
  ],
};
const emptyForm = {
  name: "", slug: "", description: "", basePrice: "", categoryId: "", brandId: "", isActive: true,
  specs: [
    { attributeId: "5", attributeValueId: "" },
    { attributeId: "6", attributeValueId: "" },
    { attributeId: "7", attributeValueId: "" },
    { attributeId: "8", attributeValueId: "" },
    { attributeId: "9", attributeValueId: "" },
  ],
  skus: [{ ...emptySku }],
};

const ProductsPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [initialSkus, setInitialSkus] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const res = searchKeyword.trim()
        ? await productServices.searchProducts(searchKeyword, pageNumber, 8)
        : await productServices.getProducts(pageNumber, 8);
      setProducts(res.data?.items || []);
      setTotalPages(res.data?.totalPage || 1);
    } catch (error) {
      console.error(error);
    }
  }, [pageNumber, searchKeyword]);

  const handleSearch = useCallback((keyword) => {
    setSearchKeyword(keyword);
    setPageNumber(1);
  }, []);

  const loadAttributes = useCallback(async () => {
    try {
      const res = await attributeServices.getAttributes();
      setAttributes(res.data || res);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryServices.getCategoryTree();
      const flatten = (nodes, result = []) => {
        nodes.forEach((node) => {
          result.push(node);
          if (node.subCategories?.length) flatten(node.subCategories, result);
        });
        return result;
      };
      setCategories(flatten(res.data || res));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadAttributes();
    loadCategories();
  }, [loadProducts, loadAttributes, loadCategories]);

  const updateField = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name") next.slug = slugify(value);
      return next;
    });
  };

  const updateNestedValue = (key, index, name, value) => {
    setForm((prev) => {
      const arr = [...prev[key]];
      arr[index] = { ...arr[index], [name]: value };
      return { ...prev, [key]: arr };
    });
  };

  const updateNestedValues = (key, index, updates) => {
    setForm((prev) => {
      const arr = [...prev[key]];
      arr[index] = { ...arr[index], ...updates };
      return { ...prev, [key]: arr };
    });
  };

  const addItem = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], value] }));
  };

  const removeItem = (key, index) => {
    setForm((prev) => {
      const filtered = prev[key].filter((_, i) => i !== index);
      return {
        ...prev,
        [key]: filtered.length ? filtered : [key === "specs" ? { ...emptySpec } : { ...emptySku }],
      };
    });
  };

  const buildPayload = () => ({
    name: form.name,
    slug: form.slug,
    description: form.description,
    basePrice: Number(form.basePrice),
    categoryId: Number(form.categoryId),
    brandId: 1,
    isActive: form.isActive,
    specs: form.specs
      .filter((s) => s.attributeId && s.attributeValueId)
      .map((s) => ({ attributeId: Number(s.attributeId), attributeValueId: Number(s.attributeValueId) })),
    skus: form.skus
      .filter((s) => s.skuCode && s.price !== "" && s.stockQuantity !== "")
      .map((s) => ({
        skuCode: s.skuCode,
        price: Number(s.price),
        stockQuantity: Number(s.stockQuantity),
        isActive: s.isActive,
        imageUrls: s.imageUrls.filter(Boolean),
        attributeValueIds: s.attributes.filter((a) => a.valueId).map((a) => Number(a.valueId)),
      })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const payload = buildPayload();
    if (payload.skus.length === 0) {
      toast.error("Sản phẩm cần ít nhất 1 SKU");
      setIsLoading(false);
      return;
    }

    try {
      if (editProductId) {
        // Update product info + specs
        await productServices.updateProduct(editProductId, {
          name: form.name,
          slug: form.slug,
          description: form.description,
          basePrice: Number(form.basePrice),
          categoryId: Number(form.categoryId),
          brandId: 1,
          isActive: form.isActive,
          specs: form.specs
            .filter((s) => s.attributeId && s.attributeValueId)
            .map((s) => ({ attributeId: Number(s.attributeId), attributeValueId: Number(s.attributeValueId) })),
        });

        // Handle SKUs: delete removed, update/create existing
        const currentSkus = form.skus.filter((s) => s.skuCode && s.price !== "" && s.stockQuantity !== "");
        const deletedSkus = initialSkus.filter((init) => !currentSkus.some((curr) => curr.id === init.id));

        for (const sku of deletedSkus) {
          await skuServices.deleteSku(editProductId, sku.id);
        }
        for (const item of currentSkus) {
          const skuPayload = {
            skuCode: item.skuCode,
            price: Number(item.price),
            stockQuantity: Number(item.stockQuantity),
            isActive: item.isActive,
            imageUrls: item.imageUrls.filter(Boolean),
            attributeValueIds: item.attributes.filter((a) => a.valueId).map((a) => Number(a.valueId)),
          };
          if (item.id) {
            await skuServices.updateSku(editProductId, item.id, skuPayload);
          } else {
            await skuServices.createSku(editProductId, skuPayload);
          }
        }

        toast.success("Cập nhật sản phẩm và biến thể thành công");
      } else {
        const res = await productServices.createProduct(payload);
        toast.success(res.message || "Tạo sản phẩm thành công");
      }

      setForm(emptyForm);
      setEditProductId(null);
      setInitialSkus([]);
      loadProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể lưu sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (product) => {
    try {
      const res = await productServices.getProductById(product.id);
      const p = res.data;
      setEditProductId(p.id);

      const loadedSkus = p.skus?.length
        ? p.skus.map((s) => ({
          id: s.id,
          skuCode: s.skuCode || "",
          price: s.price ?? "",
          stockQuantity: s.stockQuantity ?? "",
          isActive: s.isActive ?? true,
          imageUrls: s.images?.map((img) => img.imageUrl).filter(Boolean) || [],
          attributes: s.attributeValues?.length
            ? s.attributeValues.map((av) => ({ attributeId: String(av.attributeId), valueId: String(av.valueId) }))
            : [{ attributeId: "", valueId: "" }],
        }))
        : [{ ...emptySku }];

      setInitialSkus(loadedSkus.filter((s) => s.id));
      setForm({
        name: p.name || "",
        slug: p.slug || "",
        description: p.description || "",
        basePrice: p.basePrice ?? "",
        categoryId: p.categoryId ?? "",
        brandId: p.brandId ?? "",
        isActive: p.isActive ?? true,
        specs: p.specs?.length
          ? p.specs.map((s) => ({ attributeId: String(s.attributeId), attributeValueId: String(s.attributeValueId) }))
          : [{ ...emptySpec }],
        skus: loadedSkus,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Không thể tải thông tin sản phẩm");
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    try {
      const res = await productServices.deleteProduct(product.id);
      toast.success(res.message || "Xóa sản phẩm thành công");
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const cancelEdit = () => {
    setEditProductId(null);
    setForm(emptyForm);
    setInitialSkus([]);
  };

  return (
    <div>
      <PageHeader badge="Sản phẩm" title="Quản lý sản phẩm" />

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <FormSection title={editProductId ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}>
          {editProductId && (
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold text-amber-700">Chế độ chỉnh sửa sản phẩm</p>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-1.5 rounded-full bg-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-300"
              >
                <X className="size-3.5" /> Hủy chỉnh sửa
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <ProductFormInfo
              form={form}
              categories={categories}
              updateField={updateField}
            />

            <ProductSpecsSection
              specs={form.specs}
              attributes={attributes}
              updateNestedValue={updateNestedValue}
              updateNestedValues={updateNestedValues}
              addItem={addItem}
              removeItem={removeItem}
            />

            <ProductSkusSection
              skus={form.skus}
              attributes={attributes}
              updateNestedValue={updateNestedValue}
              removeItem={removeItem}
              addItem={addItem}
            />

            <SubmitButton isLoading={isLoading}>
              {editProductId ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
            </SubmitButton>
          </form>
        </FormSection>

        <ProductListPanel
          products={products}
          pageNumber={pageNumber}
          totalPages={totalPages}
          setPage={setPageNumber}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onPrevPage={() => setPageNumber((p) => Math.max(1, p - 1))}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
