import Image from "next/image";
import Link from "next/link";

const RelatedProducts = ({ products = [] }) => {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="mb-8 font-serif text-2xl text-ink sm:text-3xl">
        You may also like
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <article
            key={String(product._id)}
            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-mist">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 50vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
              <h3 className="line-clamp-2 text-sm font-semibold break-words text-ink sm:text-lg">
                {product.name}
              </h3>
              <p className="line-clamp-2 text-xs font-semibold text-smoke">
                CATEGORY:{" "}
                {product.category && (
                  <span className="mr-1.5 text-xs font-semibold uppercase ">
                    {product.category.replace("-", " ")}
                  </span>
                )}
              </p> 

              <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-base font-semibold text-brand">
                  ৳{Number(product.price).toLocaleString()}
                </span>
              </div>
                <Link
                  href={`/products/${product._id}`}
                  className="block w-full rounded-full bg-brand px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark sm:w-auto sm:py-2"
                >
                  View Details
                </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;