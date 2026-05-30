import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MobileTopBarProps = {
  title: string;
  subtitle?: string;
};

export function MobileTopBar({ title, subtitle }: MobileTopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between gap-3 px-4 pb-3"
      style={{ paddingTop: Math.max(insets.top, 8) }}
    >
      <View className="min-w-0 flex-1 pr-1">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-xl font-semibold text-slate-900"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="mt-0.5 text-sm text-slate-600">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
