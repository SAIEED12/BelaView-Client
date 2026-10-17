import { ProductGrid } from "@/components/products/ProductCard";

const RelatedProducts = ({ products = [] }) => {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-ink pt-10">
      <h2 className="mb-8 font-semibold text-2xl text-ink sm:text-2xl">
        You may also like
      </h2>

      <ProductGrid products={products} />
    </section>
  );
};

export default RelatedProducts;
