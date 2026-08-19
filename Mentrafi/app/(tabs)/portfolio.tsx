import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { API_URL } from "../../utils/api";
import BottomNav from "./BottomNav";
import { AuthBackground, C, depthShadow } from "../(auth)/login";

const GREEN = "#4ade80";
const RED = "#ff6b81";

type AssetClass = "Equity" | "Debt" | "Hybrid";

type Holding = {
  id: string;
  name: string;
  assetClass: AssetClass;
  units: number;
  value: number;
  change: number;
};

type Allocation = { label: AssetClass; value: number; percent: number };

type PortfolioData = {
  totalValue: number;
  investedValue: number;
  gainValue: number;
  gainPercent: number;
  todayChange: number;
  todayChangePercent: number;
  xirr: number;
  holdings: Holding[];
  allocations: Allocation[];
};

const ASSET_COLORS: Record<AssetClass, string> = {
  Equity: C.pink,
  Hybrid: C.cyan,
  Debt: C.violet,
};

const FILTERS: ("All" | AssetClass)[] = ["All", "Equity", "Debt", "Hybrid"];

// Compact Indian-style number formatting: 245680.5 -> "2.46L", 12500000 -> "1.25Cr"
function formatCompact(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${(value / 1e7).toFixed(decimals)}Cr`;
  if (abs >= 1e5) return `${(value / 1e5).toFixed(decimals)}L`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

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
        stroke={C.inputBorder}
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
  const [activeTab, setActiveTab] = useState("Portfolio");
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState<"All" | AssetClass>("All");
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchPortfolio() {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/onboarding" as any);
        return;
      }
      const res = await fetch(`${API_URL}/api/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      const data = await res.json();
      setPortfolio(data);
    } catch (err) {
      console.error("Portfolio fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const tabs = [
    { name: "Home", icon: Home, route: "/home" },
    { name: "Explore", icon: Search, route: "/explore" },
    { name: "Portfolio", icon: PieChartIcon, route: "/portfolio" },
    { name: "AI Advisor", icon: Sparkles, route: "/ai-advisor" },
    { name: "Profile", icon: User, route: "/profile" },
  ];

  const allocations = portfolio?.allocations ?? [];
  const totalValue = portfolio?.totalValue ?? 0;
  const todayChange = portfolio?.todayChange ?? 0;
  const todayChangePercent = portfolio?.todayChangePercent ?? 0;
  const investedValue = `₹${formatCompact(portfolio?.investedValue ?? 0, 2)}`;
  const gainValue = `${(portfolio?.gainValue ?? 0) >= 0 ? "+" : "-"}₹${formatCompact(
    Math.abs(portfolio?.gainValue ?? 0),
    1
  )}`;
  const xirrValue = `${(portfolio?.xirr ?? 0).toFixed(1)}%`;
  const isTodayPositive = todayChangePercent >= 0;
  const isGainPositive = (portfolio?.gainValue ?? 0) >= 0;

  const filteredHoldings = useMemo(() => {
    const list = portfolio?.holdings ?? [];
    if (filter === "All") return list;
    return list.filter((h) => h.assetClass === filter);
  }, [filter, portfolio]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Header — same glass-card gradient as the rest of the app */}
          <LinearGradient
            colors={[C.card, "#050508"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 32,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              borderBottomWidth: 1,
              borderColor: C.cardEdge,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <View>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 24, marginBottom: 2 }}>
                  My Portfolio
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 12 }}>Track your investments</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowBalance((s) => !s)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: C.input,
                  borderWidth: 1,
                  borderColor: C.inputBorder,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showBalance ? (
                  <Eye size={18} color={C.textMuted} />
                ) : (
                  <EyeOff size={18} color={C.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: C.input,
                borderWidth: 1,
                borderColor: C.inputBorder,
                borderRadius: 24,
                padding: 20,
              }}
            >
              <Text style={{ color: C.pink, fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 8 }}>
                TOTAL VALUE
              </Text>
              <Text style={{ color: "#fff", fontSize: 32, fontWeight: "700", marginBottom: 8 }}>
                {showBalance
                  ? `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "₹••••••••"}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: isTodayPositive ? "rgba(74,222,128,0.15)" : "rgba(255,107,129,0.15)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  {isTodayPositive ? (
                    <TrendingUp size={13} color={GREEN} />
                  ) : (
                    <TrendingDown size={13} color={RED} />
                  )}
                  <Text style={{ color: isTodayPositive ? GREEN : RED, fontSize: 12, fontWeight: "700" }}>
                    {isTodayPositive ? "+" : ""}
                    {todayChangePercent}% today
                  </Text>
                </View>
                <Text style={{ color: C.textFaint, fontSize: 12 }}>
                  {isTodayPositive ? "+" : "-"}₹{Math.abs(todayChange).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: C.inputBorder,
                }}
              >
                <View>
                  <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>Invested</Text>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{investedValue}</Text>
                </View>
                <View>
                  <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>Gain</Text>
                  <Text style={{ color: isGainPositive ? GREEN : RED, fontWeight: "700", fontSize: 14 }}>{gainValue}</Text>
                </View>
                <View>
                  <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>XIRR</Text>
                  <Text style={{ color: C.cyan, fontWeight: "700", fontSize: 14 }}>{xirrValue}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Asset Allocation */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17, marginBottom: 14 }}>
              Asset Allocation
            </Text>

            <View
              style={{
                backgroundColor: C.input,
                borderWidth: 1,
                borderColor: C.inputBorder,
                borderRadius: 20,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AllocationDonut allocations={allocations} />

              <View style={{ flex: 1, marginLeft: 18, gap: 12 }}>
                {allocations.map((a) => (
                  <View key={a.label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: ASSET_COLORS[a.label],
                        }}
                      />
                      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>{a.label}</Text>
                    </View>
                    <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: "600" }}>{a.percent}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Holdings */}
          <View style={{ paddingTop: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 24,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>Holdings</Text>
              <Text style={{ color: C.textFaint, fontSize: 12 }}>
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
                  <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.85}>
                    {active ? (
                      <LinearGradient
                        colors={[C.pink, C.violet]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
                      >
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{f}</Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          backgroundColor: C.input,
                          borderWidth: 1,
                          borderColor: C.inputBorder,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderRadius: 999,
                        }}
                      >
                        <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: "500" }}>{f}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ paddingHorizontal: 24 }}>
              <View
                style={{
                  backgroundColor: C.input,
                  borderWidth: 1,
                  borderColor: C.inputBorder,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <FlatList
                  data={filteredHoldings}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => {
                    const positive = item.change >= 0;
                    return (
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 16,
                          paddingVertical: 13,
                          borderBottomWidth: index < filteredHoldings.length - 1 ? 1 : 0,
                          borderBottomColor: C.inputBorder,
                        }}
                      >
                        <View
                          style={{
                            width: 3,
                            height: 38,
                            borderRadius: 2,
                            marginRight: 12,
                            backgroundColor: positive ? GREEN : RED,
                          }}
                        />
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            marginRight: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255,79,129,0.14)",
                          }}
                        >
                          {positive ? (
                            <TrendingUp size={16} color={C.pink} />
                          ) : (
                            <TrendingDown size={16} color={C.pink} />
                          )}
                        </View>

                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text
                            style={{ color: "#fff", fontWeight: "600", fontSize: 13, marginBottom: 2 }}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={{ color: C.textFaint, fontSize: 11 }}>
                            {item.assetClass} · {item.units.toFixed(2)} units
                          </Text>
                        </View>

                        <View style={{ alignItems: "flex-end", marginRight: 8 }}>
                          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                            ₹{item.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </Text>
                          <Text style={{ color: positive ? GREEN : RED, fontSize: 11, fontWeight: "600" }}>
                            {positive ? "+" : ""}
                            {item.change}%
                          </Text>
                        </View>

                        <ChevronRight size={16} color={C.textFaint} />
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                      <Text style={{ color: C.textMuted, fontSize: 13 }}>
                        {loading ? "Loading holdings..." : "No holdings in this category."}
                      </Text>
                    </View>
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation — shared component */}
        <BottomNav tabs={tabs} paddingBottom={10} />
      </SafeAreaView>
    </View>
  );
}