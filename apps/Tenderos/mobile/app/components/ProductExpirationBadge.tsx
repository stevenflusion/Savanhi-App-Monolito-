import { Text, View } from "react-native";

export type ExpirationStatus =
  | "Sin expiracion"
  | "Vigente"
  | "Por vencer"
  | "Vence hoy"
  | "Expirado";

type ProductExpirationBadgeProps = {
  status: ExpirationStatus;
};

const statusClassMap: Record<ExpirationStatus, string> = {
  "Sin expiracion": "border-slate-200 bg-slate-100 text-slate-600",
  Vigente: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Por vencer": "border-orange-200 bg-orange-50 text-orange-700",
  "Vence hoy": "border-amber-200 bg-amber-50 text-amber-700",
  Expirado: "border-rose-200 bg-rose-50 text-rose-700",
};

export function ProductExpirationBadge({ status }: ProductExpirationBadgeProps) {
  return (
    <View className={`rounded-lg border px-2 py-1 ${statusClassMap[status]}`}>
      <Text className="text-xs font-semibold">{status}</Text>
    </View>
  );
}

export function getExpirationStatus(
  expirationDate?: string,
  nowDate: Date = new Date()
): ExpirationStatus {
  if (!expirationDate?.trim()) return "Sin expiracion";

  const [y, m, d] = expirationDate.split("-").map(Number);
  if (!y || !m || !d) return "Sin expiracion";

  const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const exp = new Date(y, m - 1, d);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / msPerDay);

  if (diffDays < 0) return "Expirado";
  if (diffDays === 0) return "Vence hoy";
  if (diffDays <= 7) return "Por vencer";
  return "Vigente";
}
