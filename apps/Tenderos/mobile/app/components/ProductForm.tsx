import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type ProductFormValues = {
  name: string;
  category: string;
  stock: number;
  expirationDate?: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
};

export function ProductForm({
  mode,
  initialValues,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [stock, setStock] = useState(
    initialValues?.stock !== undefined ? String(initialValues.stock) : ""
  );
  const [expirationDate, setExpirationDate] = useState(
    initialValues?.expirationDate ?? ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "create") {
      setName("");
      setCategory("");
      setStock("");
      setExpirationDate("");
      setError("");
    }
  }, [mode]);

  const handleSubmit = () => {
    const parsedStock = Number(stock);
    if (!name.trim() || !category.trim() || Number.isNaN(parsedStock) || parsedStock < 0) {
      setError("Completa nombre, categoria y stock valido.");
      return;
    }

    if (expirationDate && !/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
      setError("Fecha invalida. Usa formato YYYY-MM-DD.");
      return;
    }

    setError("");
    onSubmit({
      name: name.trim(),
      category: category.trim(),
      stock: parsedStock,
      expirationDate: expirationDate.trim() || undefined,
    });
  };

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Text className="text-base font-semibold text-slate-900">
        {mode === "create" ? "Agregar producto" : "Editar producto"}
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
        placeholderTextColor="#94a3b8"
        className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900"
      />
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Categoria"
        placeholderTextColor="#94a3b8"
        className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900"
      />
      <TextInput
        value={stock}
        onChangeText={setStock}
        placeholder="Stock inicial"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900"
      />
      <TextInput
        value={expirationDate}
        onChangeText={setExpirationDate}
        placeholder="Expiracion opcional (YYYY-MM-DD)"
        placeholderTextColor="#94a3b8"
        className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900"
      />

      {error ? <Text className="mt-2 text-xs text-rose-600">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        className="mt-3 min-h-[44px] items-center justify-center rounded-xl bg-emerald-600"
      >
        <Text className="font-semibold text-white">{submitLabel}</Text>
      </Pressable>
    </View>
  );
}
