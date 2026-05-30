import { Text, View } from "react-native";

type InventorySummaryCardProps = {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  expiringSoon?: number;
  expired?: number;
};

export function InventorySummaryCard({
  total,
  inStock,
  lowStock,
  outOfStock,
  expiringSoon = 0,
  expired = 0,
}: InventorySummaryCardProps) {
  return (
    <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Text className="text-lg font-semibold text-slate-900">Inventario</Text>
      <View className="mt-4 flex-row flex-wrap gap-2">
        <MetricChip label="Total" value={total} tone="slate" />
        <MetricChip label="Con stock" value={inStock} tone="green" />
        <MetricChip label="Stock bajo" value={lowStock} tone="amber" />
        <MetricChip label="Sin stock" value={outOfStock} tone="red" />
        <MetricChip label="Por vencer" value={expiringSoon} tone="orange" />
        <MetricChip label="Expirados" value={expired} tone="red" />
      </View>
    </View>
  );
}

function MetricChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "green" | "amber" | "orange" | "red";
}) {
  const toneClass = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <View className={`rounded-xl px-3 py-2 ${toneClass}`}>
      <Text className="text-xs">{label}</Text>
      <Text className="text-base font-semibold">{value}</Text>
    </View>
  );
}
