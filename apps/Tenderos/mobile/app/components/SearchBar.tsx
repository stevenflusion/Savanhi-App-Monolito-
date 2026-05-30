import { TextInput, View } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar por nombre o categoria"
        placeholderTextColor="#94a3b8"
        className="text-slate-900"
        accessibilityLabel="Buscar productos"
      />
    </View>
  );
}
