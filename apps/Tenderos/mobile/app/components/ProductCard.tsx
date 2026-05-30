import { Text, View } from "react-native";
import {
  getExpirationStatus,
  ProductExpirationBadge,
} from "./ProductExpirationBadge";
import { StockBadge } from "./StockBadge";

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  sold: number;
  expirationDate?: string;
};

type ProductCardProps = {
  product: Product;
  now?: Date;
};

export function ProductCard({ product, now = new Date() }: ProductCardProps) {
  const expirationStatus = getExpirationStatus(product.expirationDate, now);

  return (
    <View className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-sm font-semibold text-slate-800">
            {product.name}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-500">{product.category}</Text>
        </View>
        <StockBadge stock={product.stock} />
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-slate-600">Stock: {product.stock}</Text>
        <Text className="text-xs text-slate-600">Vendidos: {product.sold}</Text>
      </View>
      <View className="mt-2">
        <ProductExpirationBadge status={expirationStatus} />
      </View>
    </View>
  );
}
