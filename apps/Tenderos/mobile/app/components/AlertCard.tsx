import { Text, View } from "react-native";

type AlertCardProps = {
  title: string;
  description: string;
  tone: "info" | "warning" | "critical";
};

const toneMap = {
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-rose-200 bg-rose-50 text-rose-700",
};

export function AlertCard({ title, description, tone }: AlertCardProps) {
  return (
    <View className={`rounded-xl border px-3 py-3 ${toneMap[tone]}`}>
      <Text className="text-sm font-semibold">{title}</Text>
      <Text className="mt-1 text-xs">{description}</Text>
    </View>
  );
}
