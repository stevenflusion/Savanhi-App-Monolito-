import { Text, View } from "react-native";

type TopProduct = {
  id: string;
  name: string;
  sold: number;
};

type TopProductsCardProps = {
  products: TopProduct[];
};

export function TopProductsCard({ products }: TopProductsCardProps) {
  return (
    <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Text className="text-base font-semibold text-slate-900">Productos mas vendidos</Text>
      <View className="mt-3 gap-2">
        {products.map((product, index) => (
          <View
            key={product.id}
            className="flex-row items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
          >
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-sm font-semibold text-slate-800">
                {index + 1}. {product.name}
              </Text>
            </View>
            <Text className="ml-3 text-sm text-slate-600">{product.sold} uds</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
