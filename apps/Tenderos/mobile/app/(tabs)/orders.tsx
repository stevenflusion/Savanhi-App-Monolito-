import { SafeAreaView } from "react-native-safe-area-context";
import { MobileTopBar } from "@/src/components/MobileTopBar";
import { ProductsWorkspace } from "@/src/components/ProductsWorkspace";

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
