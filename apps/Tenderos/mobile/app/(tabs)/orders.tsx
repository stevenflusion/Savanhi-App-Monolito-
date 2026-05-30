import { SafeAreaView } from "react-native";
import { MobileTopBar } from "../components/MobileTopBar";
import { ProductsWorkspace } from "../components/ProductsWorkspace";

export default function ProductsTab() {
  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <MobileTopBar
        title="Productos"
        subtitle="Agrega, vende y controla inventario por categoria"
      />
      <ProductsWorkspace />
    </SafeAreaView>
  );
}
