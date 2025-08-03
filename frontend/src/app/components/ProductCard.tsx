import React from "react";

export interface Product {
  title: string;
  price: string;
  link: string;
  image: string;
  source: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 w-60 hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer fadeInUp"
    >
      <a href={product.link} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-40 object-contain mb-3 rounded"
          loading="lazy"
        />
        <h3 className="text-sm font-semibold mb-2 line-clamp-2">{product.title}</h3>
      </a>
      <p className="text-lg font-bold text-indigo-600">{product.price}</p>
      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
        {product.source}
      </span>
    </div>
  );
};

export default ProductCard;
