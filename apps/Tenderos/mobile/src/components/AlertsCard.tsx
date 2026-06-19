import { Text, View } from "react-native";

type AlertItem = {
  id: string;
  label: string;
  tone: "amber" | "rose" | "sky";
};

type AlertsCardProps = {
  alerts: AlertItem[];
};

const alertToneMap = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  sky: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export function AlertsCard({ alerts }: AlertsCardProps) {
  return (
    <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Text className="text-base font-semibold text-slate-900">Alertas importantes</Text>
      <View className="mt-3 gap-2">
        {alerts.map((alert) => (
          <View
            key={alert.id}
            className={`rounded-xl border px-3 py-3 ${alertToneMap[alert.tone]}`}
          >
            <Text className="text-sm">{alert.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
