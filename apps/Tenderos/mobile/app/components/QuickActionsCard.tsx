import { Pressable, Text, View } from "react-native";

type QuickAction = {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
};

type QuickActionsCardProps = {
  actions: QuickAction[];
};

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
  return (
    <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Text className="text-base font-semibold text-slate-900">Accesos rapidos</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={action.onPress}
            className="min-h-[48px] min-w-[31%] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text className="text-xs text-emerald-700">{action.icon}</Text>
            <Text className="mt-1 text-sm font-semibold text-slate-800">{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
