import Hero from "@/components/Hero";
import ShopByCategory from "@/components/home/ShopByCategory";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyBelaView from "@/components/home/WhyBelaView";

const SERVER_URL = process.env.SERVER_URL;

async function getProducts() {
  try {
    const res = await fetch(`${SERVER_URL}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="bg-white flex min-h-screen flex-col">
      <Hero />
      <ShopByCategory products={products} />
      <FeaturedProducts products={products} />
      <WhyBelaView />
    </div>
  );
}
