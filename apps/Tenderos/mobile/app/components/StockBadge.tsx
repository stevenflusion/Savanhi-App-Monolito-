import { Text, View } from "react-native";

type StockBadgeProps = {
  stock: number;
};

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <View className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1">
        <Text className="text-xs font-semibold text-rose-700">Agotado</Text>
      </View>
    );
  }

  if (stock <= 5) {
    return (
      <View className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1">
        <Text className="text-xs font-semibold text-amber-700">Bajo stock</Text>
      </View>
    );
  }

  return (
    <View className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1">
      <Text className="text-xs font-semibold text-emerald-700">En stock</Text>
    </View>
  );
}
