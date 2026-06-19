import { Pressable, Text, View } from "react-native";

type FilterTabsProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function FilterTabs({ options, value, onChange }: FilterTabsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            className={`min-h-[44px] rounded-xl border px-3 py-2 ${
              active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${active ? "text-emerald-800" : "text-slate-700"}`}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
