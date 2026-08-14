import { useRouter } from "expo-router";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  PieChart as PieChartIcon,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

// ---------------------------------------------------------------------------
// Brand palette — matches home, explore, ai-advisor & profile screens.
// ---------------------------------------------------------------------------
const NAVY = "#12131c";
const NAVY_SOFT = "rgba(255,255,255,0.06)";
const NAVY_BORDER = "rgba(255,255,255,0.10)";
const GOLD = "#D4AF37";
const GOLD_SOFT = "rgba(212,175,55,0.16)";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";

type AssetClass = "Equity" | "Debt" | "Hybrid";

type Holding = {
  id: string;
  name: string;
  assetClass: AssetClass;
  units: number;
  value: number;
  change: number;
};

const HOLDINGS: Holding[] = [
  { id: "1", name: "HDFC Balanced Advantage Fund", assetClass: "Hybrid", units: 1250.45, value: 68420.3, change: 2.5 },
  { id: "2", name: "SBI Small Cap Fund", assetClass: "Equity", units: 860.2, value: 48650.75, change: -1.2 },
  { id: "3", name: "ICICI Prudential Bluechip Fund", assetClass: "Equity", units: 2130.0, value: 62340.0, change: 3.8 },
  { id: "4", name: "Axis Midcap Fund", assetClass: "Equity", units: 540.1, value: 26270.45, change: 5.1 },
  { id: "5", name: "Meridian Large Cap Growth", assetClass: "Equity", units: 420.8, value: 40000.0, change: 26.2 },
  { id: "6", name: "Crestline Short Duration", assetClass: "Debt", units: 310.0, value: 21540.0, change: 1.1 },
];

const ASSET_COLORS: Record<AssetClass, string> = {
  Equity: GOLD,
  Hybrid: BLUE,
  Debt: PURPLE,
};

const FILTERS: ("All" | AssetClass)[] = ["All", "Equity", "Debt", "Hybrid"];

const totalValue = HOLDINGS.reduce((sum, h) => sum + h.value, 0);
const todayChange = 3420.75;
const todayChangePercent = 1.42;
const investedValue = "₹2.00L";
const gainValue = "+₹45.6K";
const xirrValue = "18.4%";

function AllocationDonut({
  allocations,
  size = 150,
  strokeWidth = 20,
}: {
  allocations: { label: AssetClass; percent: number }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAccum = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={NAVY_SOFT}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {allocations.map((a) => {
        const segmentLength = (a.percent / 100) * circumference;
        const circle = (
          <Circle
            key={a.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ASSET_COLORS[a.label]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            strokeDashoffset={-offsetAccum}
            strokeLinecap="butt"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        );
        offsetAccum += segmentLength;
        return circle;
      })}
    </Svg>
  );
}

export default function PortfolioScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("Portfolio");
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState<"All" | AssetClass>("All");

  const tabs = [
    { name: "Home", icon: Home, route: "/home" },
    { name: "Explore", icon: Search, route: "/explore" },
    { name: "Portfolio", icon: PieChartIcon, route: "/portfolio" },
    { name: "AI Advisor", icon: Sparkles, route: "/ai-advisor" },
    { name: "Profile", icon: User, route: "/profile" },
  ];

  const allocations = useMemo(() => {
    const byClass: Record<AssetClass, number> = { Equity: 0, Debt: 0, Hybrid: 0 };
    HOLDINGS.forEach((h) => {
      byClass[h.assetClass] += h.value;
    });
    return (Object.keys(byClass) as AssetClass[])
      .map((label) => ({
        label,
        value: byClass[label],
        percent: Math.round((byClass[label] / totalValue) * 1000) / 10,
      }))
      .filter((a) => a.value > 0);
  }, []);

  const filteredHoldings = useMemo(() => {
    if (filter === "All") return HOLDINGS;
    return HOLDINGS.filter((h) => h.assetClass === filter);
  }, [filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header — navy, matches home screen hero */}
        <View style={{ backgroundColor: NAVY }} className="px-6 pt-6 pb-8 rounded-b-[32px]">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-white font-bold text-2xl mb-0.5">My Portfolio</Text>
              <Text className="text-white/50 text-xs">Track your investments</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowBalance((s) => !s)}
              style={{ backgroundColor: NAVY_SOFT }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              {showBalance ? (
                <Eye size={18} color="rgba(255,255,255,0.6)" />
              ) : (
                <EyeOff size={18} color="rgba(255,255,255,0.6)" />
              )}
            </TouchableOpacity>
          </View>

          <View
            style={{ backgroundColor: NAVY_SOFT, borderColor: NAVY_BORDER }}
            className="rounded-3xl p-5 border"
          >
            <Text style={{ color: GOLD }} className="text-xs font-semibold tracking-widest mb-2">
              TOTAL VALUE
            </Text>
            <Text className="text-white text-[32px] font-bold mb-2">
              {showBalance
                ? `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                : "₹••••••••"}
            </Text>

            <View className="flex-row items-center gap-2 mb-4">
              <View className="flex-row items-center gap-1 bg-green-500/20 px-2.5 py-1 rounded-full">
                <TrendingUp size={13} color="#86efac" />
                <Text className="text-green-300 text-xs font-semibold">
                  +{todayChangePercent}% today
                </Text>
              </View>
              <Text className="text-white/50 text-xs">
                +₹{todayChange.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View
              style={{ borderTopColor: NAVY_BORDER }}
              className="flex-row justify-between pt-4 border-t"
            >
              <View className="items-start">
                <Text className="text-white/45 text-[11px] mb-1">Invested</Text>
                <Text className="text-white font-semibold text-sm">{investedValue}</Text>
              </View>
              <View className="items-start">
                <Text className="text-white/45 text-[11px] mb-1">Gain</Text>
                <Text className="text-green-300 font-semibold text-sm">{gainValue}</Text>
              </View>
              <View className="items-start">
                <Text className="text-white/45 text-[11px] mb-1">XIRR</Text>
                <Text style={{ color: GOLD }} className="font-semibold text-sm">
                  {xirrValue}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Asset Allocation */}
        <View className="px-6 pt-6">
          <Text style={{ color: colors.text }} className="font-bold text-lg mb-4">
            Asset Allocation
          </Text>

          <View
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            className="rounded-2xl border p-5 flex-row items-center"
          >
            <AllocationDonut allocations={allocations} />

            <View className="flex-1 ml-5 gap-3">
              {allocations.map((a) => (
                <View key={a.label} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{ backgroundColor: ASSET_COLORS[a.label] }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <Text style={{ color: colors.text }} className="text-sm font-medium">
                      {a.label}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
                    {a.percent}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Holdings */}
        <View className="pt-6">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              Holdings
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              {filteredHoldings.length} fund{filteredHoldings.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8, marginBottom: 16 }}
          >
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    backgroundColor: active ? NAVY : colors.cardBg,
                    borderColor: active ? NAVY : colors.border,
                  }}
                  className="px-5 py-2.5 rounded-full border"
                >
                  <Text
                    style={{ color: active ? "white" : colors.textSecondary }}
                    className="text-sm font-medium"
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="px-6">
            <View
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
              className="rounded-2xl border overflow-hidden"
            >
              <FlatList
                data={filteredHoldings}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item, index }) => {
                  const positive = item.change >= 0;
                  return (
                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      style={{
                        borderBottomWidth: index < filteredHoldings.length - 1 ? 1 : 0,
                        borderBottomColor: colors.divider,
                      }}
                    >
                      <View
                        style={{ backgroundColor: positive ? GREEN : RED }}
                        className="w-1 h-10 rounded-full mr-3"
                      />
                      <View
                        style={{ backgroundColor: GOLD_SOFT }}
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      >
                        {positive ? (
                          <TrendingUp size={16} color={GOLD} />
                        ) : (
                          <TrendingDown size={16} color={GOLD} />
                        )}
                      </View>

                      <View className="flex-1 mr-2">
                        <Text
                          style={{ color: colors.text }}
                          numberOfLines={1}
                          className="font-semibold text-sm mb-0.5"
                        >
                          {item.name}
                        </Text>
                        <Text style={{ color: colors.textSecondary }} className="text-xs">
                          {item.assetClass} · {item.units.toFixed(2)} units
                        </Text>
                      </View>

                      <View className="items-end mr-2">
                        <Text style={{ color: colors.text }} className="font-bold text-sm">
                          ₹{item.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Text>
                        <Text
                          style={{ color: positive ? GREEN : RED }}
                          className="text-xs font-semibold"
                        >
                          {positive ? "+" : ""}
                          {item.change}%
                        </Text>
                      </View>

                      <ChevronRight size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View className="items-center justify-center py-10">
                    <Text style={{ color: colors.textSecondary }} className="text-sm">
                      No holdings in this category.
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={{ backgroundColor: colors.cardBg, borderTopColor: colors.divider }}
        className="flex-row items-center justify-around px-2 pt-2 pb-6 border-t"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => {
                setActiveTab(tab.name);
                if (tab.route) router.push(tab.route as any);
              }}
              className="items-center gap-1 flex-1"
            >
              <tab.icon size={22} color={isActive ? GOLD : colors.textSecondary} />
              <Text
                className="text-[10px]"
                style={{
                  color: isActive ? GOLD : colors.textSecondary,
                  fontWeight: isActive ? "600" : "400",
                }}
              >
                {tab.name}
              </Text>
              {isActive && (
                <View style={{ backgroundColor: GOLD }} className="w-1 h-1 rounded-full mt-0.5" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}