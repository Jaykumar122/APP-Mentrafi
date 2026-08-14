import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calculator,
  Calendar,
  Pause,
  Pencil,
  Plus,
  TrendingUp,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

// ---------------------------------------------------------------------------
// Brand palette — matches home, explore, portfolio, ai-advisor & profile.
// ---------------------------------------------------------------------------
const NAVY = "#12131c";
const NAVY_SOFT = "rgba(255,255,255,0.10)";
const NAVY_BORDER = "rgba(255,255,255,0.18)";
const GOLD = "#D4AF37";
const GOLD_SOFT = "rgba(212,175,55,0.16)";
const GREEN = "#22c55e";
const GREEN_SOFT_LIGHT = "#dcfce7";
const GREEN_SOFT_DARK = "#14532d";

type SIP = {
  name: string;
  type: "Equity" | "Debt";
  completed: number;
  total: number;
  monthlyAmount: number;
  nextDate: string;
  totalInvested: number;
  currentValue: number;
  returns: number;
};

const activeSIPs: SIP[] = [
  {
    name: "HDFC Balanced Advantage Fund",
    type: "Equity",
    completed: 24,
    total: 120,
    monthlyAmount: 5000,
    nextDate: "15 May 2026",
    totalInvested: 120000,
    currentValue: 145820,
    returns: 21.52,
  },
  {
    name: "SBI Small Cap Fund",
    type: "Equity",
    completed: 18,
    total: 60,
    monthlyAmount: 3000,
    nextDate: "10 May 2026",
    totalInvested: 54000,
    currentValue: 61240,
    returns: 13.41,
  },
  {
    name: "ICICI Prudential Bluechip Fund",
    type: "Equity",
    completed: 36,
    total: 120,
    monthlyAmount: 7500,
    nextDate: "20 May 2026",
    totalInvested: 270000,
    currentValue: 324500,
    returns: 20.19,
  },
];

const pausedSIPs: SIP[] = [
  {
    name: "Axis Liquid Fund",
    type: "Debt",
    completed: 12,
    total: 60,
    monthlyAmount: 2000,
    nextDate: "Paused",
    totalInvested: 24000,
    currentValue: 25800,
    returns: 7.5,
  },
];

export default function SIPDashboard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"active" | "paused">("active");

  const sips = activeTab === "active" ? activeSIPs : pausedSIPs;
  const monthlySIP = activeSIPs.reduce((sum, s) => sum + s.monthlyAmount, 0);
  const totalInvested = activeSIPs.reduce((sum, s) => sum + s.totalInvested, 0);

  const formatINR = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header — navy, matches home/portfolio hero */}
      <View
        style={{ backgroundColor: NAVY }}
        className="px-5 pt-14 pb-6 rounded-b-[32px]"
      >
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: NAVY_SOFT }}
              className="w-9 h-9 rounded-full items-center justify-center"
            >
              <ArrowLeft size={18} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-xl">My SIPs</Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push("/sip-calculator" as any)}
              style={{ backgroundColor: NAVY_SOFT }}
              className="w-9 h-9 rounded-full items-center justify-center"
            >
              <Calculator size={16} color={GOLD} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: NAVY_SOFT }}
              className="w-9 h-9 rounded-full items-center justify-center"
            >
              <Plus size={16} color={GOLD} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-3 mb-5">
          <View
            style={{ backgroundColor: NAVY_SOFT, borderColor: NAVY_BORDER }}
            className="flex-1 rounded-2xl p-4 border"
          >
            <Text className="text-white/50 text-xs mb-1">Monthly SIP</Text>
            <Text className="text-white text-xl font-bold">{formatINR(monthlySIP)}</Text>
          </View>
          <View
            style={{ backgroundColor: NAVY_SOFT, borderColor: NAVY_BORDER }}
            className="flex-1 rounded-2xl p-4 border"
          >
            <Text className="text-white/50 text-xs mb-1">Total Invested</Text>
            <Text style={{ color: GOLD }} className="text-xl font-bold">
              {formatINR(totalInvested)}
            </Text>
          </View>
        </View>

        {/* Segmented tabs */}
        <View
          style={{ backgroundColor: NAVY_SOFT }}
          className="flex-row rounded-full p-1"
        >
          <TouchableOpacity
            onPress={() => setActiveTab("active")}
            style={{ backgroundColor: activeTab === "active" ? GOLD : "transparent" }}
            className="flex-1 py-2.5 rounded-full items-center"
          >
            <Text
              style={{ color: activeTab === "active" ? NAVY : "white" }}
              className="text-xs font-bold"
            >
              Active ({activeSIPs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("paused")}
            style={{ backgroundColor: activeTab === "paused" ? GOLD : "transparent" }}
            className="flex-1 py-2.5 rounded-full items-center"
          >
            <Text
              style={{ color: activeTab === "paused" ? NAVY : "white" }}
              className="text-xs font-bold"
            >
              Paused ({pausedSIPs.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SIP Cards */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {sips.map((sip, index) => {
          const progress = (sip.completed / sip.total) * 100;
          return (
            <View
              key={index}
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
              className="rounded-2xl border p-4"
            >
              {/* Top row */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-2">
                  <Text style={{ color: colors.text }} className="font-bold text-sm mb-1.5">
                    {sip.name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View style={{ backgroundColor: GOLD_SOFT }} className="px-2.5 py-1 rounded-full">
                      <Text style={{ color: GOLD }} className="text-[10px] font-bold">
                        {sip.type}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary }} className="text-[11px]">
                      {sip.completed}/{sip.total} completed
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border }}
                    className="w-8 h-8 rounded-lg items-center justify-center border"
                  >
                    <Pencil size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.border }}
                    className="w-8 h-8 rounded-lg items-center justify-center border"
                  >
                    <Pause size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Monthly + next date */}
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] mb-0.5">
                    Monthly Amount
                  </Text>
                  <Text style={{ color: colors.text }} className="text-base font-bold">
                    {formatINR(sip.monthlyAmount)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] mb-0.5">
                    Next Installment
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Calendar size={12} color={colors.textSecondary} />
                    <Text style={{ color: colors.text }} className="text-xs font-semibold">
                      {sip.nextDate}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress bar */}
              <View
                style={{ backgroundColor: colors.border }}
                className="h-1.5 rounded-full mb-3 overflow-hidden"
              >
                <View
                  style={{ backgroundColor: GOLD, width: `${progress}%` }}
                  className="h-full rounded-full"
                />
              </View>

              {/* Bottom row */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] mb-0.5">
                    Total Invested
                  </Text>
                  <Text style={{ color: colors.text }} className="text-xs font-bold">
                    {formatINR(sip.totalInvested)}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] mb-0.5">
                    Current Value
                  </Text>
                  <Text style={{ color: colors.text }} className="text-xs font-bold">
                    {formatINR(sip.currentValue)}
                  </Text>
                </View>
                <View
                  style={{ backgroundColor: isDark ? GREEN_SOFT_DARK : GREEN_SOFT_LIGHT }}
                  className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full"
                >
                  <TrendingUp size={12} color={GREEN} />
                  <Text style={{ color: GREEN }} className="text-xs font-bold">
                    +{sip.returns}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}