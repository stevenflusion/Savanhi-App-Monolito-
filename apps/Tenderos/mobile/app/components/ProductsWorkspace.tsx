import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AlertCard } from "./AlertCard";
import { EmptyState } from "./EmptyState";
import { FilterTabs } from "./FilterTabs";
import { getExpirationStatus } from "./ProductExpirationBadge";
import { ProductCard, type Product } from "./ProductCard";
import { ProductForm } from "./ProductForm";
import { SearchBar } from "./SearchBar";
import { InventorySummaryCard } from "./InventorySummaryCard";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Arroz 1kg",
    category: "Granos",
    stock: 15,
    sold: 42,
    expirationDate: "2026-12-15",
  },
  {
    id: "p2",
    name: "Aceite 900ml",
    category: "Despensa",
    stock: 6,
    sold: 31,
    expirationDate: "2026-06-03",
  },
  {
    id: "p3",
    name: "Gaseosa 500ml",
    category: "Bebidas",
    stock: 2,
    sold: 27,
  },
  {
    id: "p4",
    name: "Galletas chocolate",
    category: "Snacks",
    stock: 0,
    sold: 22,
    expirationDate: "2026-05-28",
  },
];

type Tool = "add" | "sale" | "inventory";

export function ProductsWorkspace() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [tool, setTool] = useState<Tool>("add");
  const [now, setNow] = useState(new Date());

  const [selectedProductId, setSelectedProductId] = useState("");
  const [saleQty, setSaleQty] = useState("1");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [feedback, setFeedback] = useState("");

  const refreshExpirationState = useCallback(() => {
    setNow(new Date());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshExpirationState();
    }, [refreshExpirationState])
  );

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const byCategory = categoryFilter === "Todas" || p.category === categoryFilter;
      const bySearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return byCategory && bySearch;
    });
  }, [products, search, categoryFilter]);

  const grouped = useMemo(
    () =>
      filteredProducts.reduce<Record<string, Product[]>>((acc, p) => {
        const current = acc[p.category] ?? [];
        acc[p.category] = [...current, p];
        return acc;
      }, {}),
    [filteredProducts]
  );

  const summary = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stock > 5).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const expiringSoon = products.filter((p) => getExpirationStatus(p.expirationDate, now) === "Por vencer").length;
    const expired = products.filter((p) => getExpirationStatus(p.expirationDate, now) === "Expirado").length;
    return { total, inStock, lowStock, outOfStock, expiringSoon, expired };
  }, [products, now]);

  const addProduct = (payload: {
    name: string;
    category: string;
    stock: number;
    expirationDate?: string;
  }) => {
    setProducts((prev) => [
      {
        id: `p-${Date.now()}`,
        name: payload.name,
        category: payload.category,
        stock: payload.stock,
        sold: 0,
        expirationDate: payload.expirationDate,
      },
      ...prev,
    ]);
    refreshExpirationState();
    setFeedback("Producto agregado correctamente.");
  };

  const registerSale = () => {
    const qty = Number(saleQty);
    if (!selectedProductId || Number.isNaN(qty) || qty <= 0) {
      setFeedback("Selecciona un producto y cantidad valida.");
      return;
    }

    let updated = false;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProductId) return p;
        if (p.stock < qty) return p;
        updated = true;
        return { ...p, stock: p.stock - qty, sold: p.sold + qty };
      })
    );

    refreshExpirationState();
    setFeedback(updated ? "Venta registrada correctamente." : "Stock insuficiente para registrar la venta.");
  };

  const selectTool = (value: Tool) => {
    setTool(value);
    if (value === "inventory") refreshExpirationState();
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-base font-semibold text-slate-900">Acciones de productos</Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {[
            { id: "add", label: "Agregar producto", value: "add" as Tool },
            { id: "sale", label: "Registrar venta", value: "sale" as Tool },
            { id: "inv", label: "Revisar inventario", value: "inventory" as Tool },
          ].map((a) => (
            <Pressable
              key={a.id}
              onPress={() => selectTool(a.value)}
              className={`min-h-[44px] min-w-[31%] flex-1 items-center justify-center rounded-xl border px-2 py-2 ${
                tool === a.value
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  tool === a.value ? "text-emerald-800" : "text-slate-700"
                }`}
              >
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tool === "add" ? (
        <View className="w-full max-w-xl self-center">
          <ProductForm mode="create" submitLabel="Guardar producto" onSubmit={addProduct} />
        </View>
      ) : null}

      {tool === "sale" ? (
        <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Text className="text-base font-semibold text-slate-900">Registrar venta</Text>
          <Text className="mt-2 text-sm text-slate-600">Selecciona producto y cantidad</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {products.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setSelectedProductId(p.id)}
                className={`rounded-xl border px-3 py-2 ${
                  selectedProductId === p.id
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <Text className="text-xs font-semibold text-slate-800">{p.name}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={saleQty}
            onChangeText={setSaleQty}
            keyboardType="numeric"
            placeholder="Cantidad"
            placeholderTextColor="#94a3b8"
            className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900"
          />
          <Pressable
            onPress={registerSale}
            className="mt-3 min-h-[44px] items-center justify-center rounded-xl bg-emerald-600"
          >
            <Text className="font-semibold text-white">Confirmar venta</Text>
          </Pressable>
        </View>
      ) : null}

      <InventorySummaryCard
        total={summary.total}
        inStock={summary.inStock}
        lowStock={summary.lowStock}
        outOfStock={summary.outOfStock}
        expiringSoon={summary.expiringSoon}
        expired={summary.expired}
      />

      <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-base font-semibold text-slate-900">Buscar y filtrar</Text>
        <View className="mt-3">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>
        <View className="mt-3">
          <FilterTabs options={categories} value={categoryFilter} onChange={setCategoryFilter} />
        </View>
      </View>

      <View className="w-full max-w-xl self-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Text className="text-base font-semibold text-slate-900">Productos por categoria</Text>
        <View className="mt-3 gap-3">
          {Object.keys(grouped).length === 0 ? (
            <EmptyState
              title="Sin productos para este filtro"
              message="Prueba con otra categoria o limpia la busqueda."
            />
          ) : (
            Object.entries(grouped).map(([cat, list]) => (
              <View key={cat}>
                <Text className="text-sm font-semibold text-emerald-800">{cat}</Text>
                <View className="mt-2 gap-2">
                  {list.map((product) => (
                    <ProductCard key={product.id} product={product} now={now} />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View className="w-full max-w-xl self-center gap-2">
        {summary.outOfStock > 0 ? (
          <AlertCard
            tone="critical"
            title="Productos agotados"
            description={`${summary.outOfStock} productos sin stock. Prioriza reposicion.`}
          />
        ) : null}
        {summary.lowStock > 0 ? (
          <AlertCard
            tone="warning"
            title="Stock bajo"
            description={`${summary.lowStock} productos con stock bajo.`}
          />
        ) : null}
        {summary.expiringSoon > 0 ? (
          <AlertCard
            tone="info"
            title="Proximos a vencer"
            description={`${summary.expiringSoon} productos deben rotarse o venderse pronto.`}
          />
        ) : null}
      </View>

      {feedback ? (
        <View className="w-full max-w-xl self-center rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2">
          <Text className="text-sm text-cyan-800">{feedback}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
