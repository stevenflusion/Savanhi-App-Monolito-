import { Text, View } from "react-native";

type DashboardStatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  tone?: "blue" | "green" | "amber" | "rose" | "violet";
};

const toneClassMap = {
  blue: "bg-cyan-100 text-cyan-800",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  rose: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-800",
};

export function DashboardStatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "blue",
}: DashboardStatCardProps) {
  return (
    <View className="min-h-[124px] flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between gap-2">
        <Text className="min-w-0 flex-1 text-sm text-slate-600">{title}</Text>
        <View className={`rounded-lg px-2 py-1 ${toneClassMap[tone]}`}>
          <Text className="text-xs font-semibold">{icon}</Text>
        </View>
      </View>
      <Text className="mt-3 text-2xl font-semibold text-slate-900">{value}</Text>
      {subtitle ? <Text className="mt-1 text-xs text-slate-500">{subtitle}</Text> : null}
    </View>
  );
}
