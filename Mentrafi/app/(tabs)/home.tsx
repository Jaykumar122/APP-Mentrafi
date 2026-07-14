import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  ArrowLeftRight,
  ArrowDownCircle,
  Bell,
  Calculator,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  Moon,
  PieChart,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Sun,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

// ---------------------------------------------------------------------------
// Brand palette — the header/hero band stays this dark-navy + gold
// combination in both light and dark app themes (matches design reference).
// ---------------------------------------------------------------------------
const NAVY = "#12131c";
const NAVY_SOFT = "rgba(255,255,255,0.06)";
const NAVY_BORDER = "rgba(255,255,255,0.10)";
const GOLD = "#D4AF37";
const GOLD_SOFT = "rgba(212,175,55,0.16)";
const GREEN = "#22c55e";
const GREEN_SOFT_LIGHT = "#dcfce7";
const GREEN_SOFT_DARK = "#14532d";
const RED = "#ef4444";
const RED_SOFT_LIGHT = "#fee2e2";
const RED_SOFT_DARK = "#7f1d1d";

const holdings = [
  {
    name: "HDFC Balanced Advantage Fund",
    units: 1250.45,
    value: 68420.3,
    change: 2.5,
  },
  {
    name: "SBI Small Cap Fund",
    units: 860.2,
    value: 48650.75,
    change: -1.2,
  },
  {
    name: "ICICI Prudential Bluechip Fund",
    units: 2130.0,
    value: 62340.0,
    change: 3.8,
  },
  {
    name: "Axis Midcap Fund",
    units: 540.1,
    value: 26270.45,
    change: 5.1,
  },
  {
    name: "Meridian Large Cap Growth",
    units: 420.8,
    value: 40000.0,
    change: 26.2,
  },
];

const marketPulse = [
  { name: "Meridian Large Cap", category: "Equity", change: 26.2, rating: 4.5 },
  { name: "Pinnacle Balanced Advantage", category: "Hybrid", change: 17.4, rating: 4 },
  { name: "Apex Mid & Small Cap", category: "Equity", change: 31.6, rating: 4.5 },
];

const totalValue = 245680.5;
const todayChange = 3420.75;
const todayChangePercent = 1.42;
const investedValue = "₹2.00L";
const gainValue = "+₹45.6K";
const xirrValue = "18.4%";

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          color={GOLD}
          fill={i <= rounded ? GOLD : "transparent"}
          strokeWidth={1.5}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark, setThemeMode } = useTheme();
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("userName").then((name) => {
      if (name) setUserName(name);
    });
  }, []);

  const tabs = [
    { name: "Home", icon: Home, route: null },
    { name: "Explore", icon: Search, route: null },
    { name: "Portfolio", icon: PieChart, route: null },
    { name: "AI Advisor", icon: Sparkles, route: null },
    { name: "Profile", icon: User, route: "/profile" },
  ];

  const quickActions = [
    { icon: PlusCircle, label: "Invest", color: "#f59e0b", bg: "#fef3c7", route: null },
    { icon: ArrowDownCircle, label: "Redeem", color: "#f43f5e", bg: "#ffe4e6", route: null },
    { icon: RefreshCw, label: "SIP", color: "#3b82f6", bg: "#dbeafe", route: "/sip-dashboard" },
    { icon: ArrowLeftRight, label: "Switch", color: "#8b5cf6", bg: "#ede9fe", route: null },
  ];

  const initials = (userName || "Rajesh Kumar")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header — always dark navy, regardless of app theme */}
        <View style={{ backgroundColor: NAVY }} className="px-6 pt-14 pb-8 rounded-b-[32px]">
          {/* Top bar */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="relative">
                <View
                  style={{ backgroundColor: GOLD }}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                >
                  <Text className="text-white font-bold text-base">{initials}</Text>
                </View>
                <View
                  style={{ borderColor: NAVY }}
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2"
                />
              </View>
              <View>
                <Text className="text-white/60 text-xs">Good morning 👋</Text>
                <Text className="text-white font-semibold text-base">
                  {userName || "Rajesh Kumar"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setThemeMode(isDark ? "light" : "dark")}
                style={{ backgroundColor: GOLD }}
                className="w-14 h-8 rounded-full items-center justify-center px-1"
              >
                <View
                  className="w-6 h-6 rounded-full bg-white items-center justify-center"
                  style={{ alignSelf: isDark ? "flex-end" : "flex-start" }}
                >
                  {isDark ? (
                    <Moon size={13} color={NAVY} />
                  ) : (
                    <Sun size={13} color={GOLD} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: NAVY_SOFT }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Bell size={18} color="white" />
                <View className="absolute top-2 right-2.5 w-2 h-2 bg-amber-400 rounded-full" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Portfolio value card */}
          <View
            style={{ backgroundColor: NAVY_SOFT, borderColor: NAVY_BORDER }}
            className="rounded-3xl p-5 border"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View style={{ backgroundColor: GOLD }} className="w-1.5 h-1.5 rounded-full" />
                <Text style={{ color: GOLD }} className="text-xs font-semibold tracking-widest">
                  PORTFOLIO
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowBalance((s) => !s)}>
                {showBalance ? (
                  <Eye size={16} color="rgba(255,255,255,0.5)" />
                ) : (
                  <EyeOff size={16} color="rgba(255,255,255,0.5)" />
                )}
              </TouchableOpacity>
            </View>

            <Text className="text-white text-[34px] font-bold mb-2">
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

            {/* Sparkline */}
            <Svg width="100%" height={48} viewBox="0 0 300 48">
              <Path
                d="M0,34 L25,30 L50,36 L75,22 L100,26 L125,14 L150,20 L175,10 L200,16 L225,8 L250,12 L275,4 L300,10"
                stroke={GOLD}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>

            {/* Stats row */}
            <View
              style={{ borderTopColor: NAVY_BORDER }}
              className="flex-row justify-between pt-4 mt-3 border-t"
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

        {/* Quick actions */}
        <View className="px-6 -mt-2 pb-2 pt-6">
          <View className="flex-row justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                className="items-center gap-2"
                onPress={() => action.route && router.push(action.route as any)}
              >
                <View
                  style={{ backgroundColor: colors.cardBg }}
                  className="w-16 h-16 rounded-2xl items-center justify-center shadow-sm"
                >
                  <View
                    style={{ backgroundColor: action.bg }}
                    className="w-10 h-10 rounded-xl items-center justify-center"
                  >
                    <action.icon size={20} color={action.color} />
                  </View>
                </View>
                <Text style={{ color: colors.text }} className="text-xs font-medium">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Market Pulse */}
        <View className="pt-4 pb-2">
          <View className="flex-row items-center justify-between px-6 mb-3">
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              Market Pulse
            </Text>
            <TouchableOpacity className="flex-row items-center gap-0.5">
              <Text style={{ color: GOLD }} className="font-medium text-sm">
                Explore
              </Text>
              <ChevronRight size={14} color={GOLD} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {marketPulse.map((fund) => (
              <View
                key={fund.name}
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                className="rounded-2xl p-4 border w-40"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <StarRow rating={fund.rating} />
                  <View
                    style={{ backgroundColor: isDark ? GREEN_SOFT_DARK : GREEN_SOFT_LIGHT }}
                    className="px-2 py-0.5 rounded-full"
                  >
                    <Text style={{ color: GREEN }} className="text-[11px] font-bold">
                      +{fund.change}%
                    </Text>
                  </View>
                </View>
                <Text style={{ color: colors.text }} className="font-semibold text-sm mb-1">
                  {fund.name}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs">
                  {fund.category}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Holdings */}
        <View className="px-6 pt-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              My Holdings
            </Text>
            <TouchableOpacity className="flex-row items-center gap-0.5">
              <Text style={{ color: GOLD }} className="font-medium text-sm">
                View All
              </Text>
              <ChevronRight size={14} color={GOLD} />
            </TouchableOpacity>
          </View>

          <View
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            className="rounded-2xl border overflow-hidden"
          >
            {holdings.map((fund, index) => {
              const positive = fund.change >= 0;
              return (
                <TouchableOpacity
                  key={fund.name}
                  className="flex-row items-center px-4 py-3"
                  style={{
                    borderBottomWidth: index < holdings.length - 1 ? 1 : 0,
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
                      {fund.name}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">
                      {fund.units.toFixed(2)} units
                    </Text>
                  </View>

                  <View className="items-end mr-2">
                    <Text style={{ color: colors.text }} className="font-bold text-sm">
                      ₹{fund.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Text>
                    <Text
                      style={{ color: positive ? GREEN : RED }}
                      className="text-xs font-semibold"
                    >
                      {positive ? "+" : ""}
                      {fund.change}%
                    </Text>
                  </View>

                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SIP Calculator banner */}
          <TouchableOpacity
            onPress={() => router.push("/sip-dashboard" as any)}
            style={{ backgroundColor: GOLD_SOFT, borderColor: "rgba(212,175,55,0.3)" }}
            className="flex-row items-center rounded-2xl border p-4 mt-4"
          >
            <View
              style={{ backgroundColor: colors.cardBg }}
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
            >
              <Calculator size={20} color={GOLD} />
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.text }} className="font-semibold text-sm">
                SIP Calculator
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs">
                See how your SIP grows over time
              </Text>
            </View>
            <ChevronRight size={18} color={GOLD} />
          </TouchableOpacity>
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
    </View>
  );
}