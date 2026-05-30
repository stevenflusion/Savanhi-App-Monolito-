import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5">
      <Text className="text-sm font-semibold text-slate-800">{title}</Text>
      <Text className="mt-1 text-sm text-slate-600">{message}</Text>
    </View>
  );
}
