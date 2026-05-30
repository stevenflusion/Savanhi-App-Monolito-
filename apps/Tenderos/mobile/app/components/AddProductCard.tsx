import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type AddProductPayload = {
  name: string;
  category: string;
  stock: number;
};

type AddProductCardProps = {
  onAddProduct: (payload: AddProductPayload) => void;
};

export function AddProductCard({ onAddProduct }: AddProductCardProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const parsedStock = Number(stock);
    if (!name.trim() || !category.trim() || Number.isNaN(parsedStock)) {
      setError("Completa nombre, categoria y stock numerico.");
      return;
    }

    if (parsedStock < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }

    setError("");
    onAddProduct({ name: name.trim(), category: category.trim(), stock: parsedStock });
    setName("");
    setCategory("");
    setStock("");
  };

  return (
    <View className="w-full max-w-xl self-center rounded-2xl bg-slate-900 p-5">
      <Text className="text-lg font-semibold text-white">Agregar producto</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
        placeholderTextColor="#64748b"
        className="mt-4 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Categoria"
        placeholderTextColor="#64748b"
        className="mt-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />
      <TextInput
        value={stock}
        onChangeText={setStock}
        placeholder="Stock inicial"
        placeholderTextColor="#64748b"
        keyboardType="numeric"
        className="mt-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />

      {error ? <Text className="mt-3 text-sm text-rose-400">{error}</Text> : null}

      <Pressable
        onPress={handleAdd}
        className="mt-4 min-h-[44px] items-center justify-center rounded-xl bg-green-500"
      >
        <Text className="text-base font-semibold text-slate-950">Guardar producto</Text>
      </Pressable>
    </View>
  );
}
