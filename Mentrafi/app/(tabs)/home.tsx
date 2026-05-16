import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bell,
  Check,
  Home,
  Moon,
  PieChart,
  PlusCircle,
  RefreshCw,
  Search,
  Sun,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

const holdings = [
  {
    name: "HDFC Balanced Advantage Fund",
    units: 1250.45,
    nav: 245.3,
    value: 68420.3,
    change: 2.5,
    type: "Equity",
  },
  {
    name: "SBI Small Cap Fund",
    units: 850.2,
    nav: 125.6,
    value: 48650.75,
    change: -1.2,
    type: "Equity",
  },
  {
    name: "ICICI Prudential Bluechip Fund",
    units: 2100.0,
    nav: 85.4,
    value: 62340.0,
    change: 3.8,
    type: "Equity",
  },
  {
    name: "Axis Liquid Fund",
    units: 3500.0,
    nav: 18.5,
    value: 66270.45,
    change: 0.05,
    type: "Debt",
  },
];

const totalValue = 245680.5;
const todayChange = 3420.75;
const todayChangePercent = 1.42;

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("userName").then((name) => {
      if (name) setUserName(name);
    });
  }, []);

  const tabs = [
    { name: "Home", icon: Home, route: null },
    { name: "Explore", icon: Search, route: null },
    { name: "Portfolio", icon: PieChart, route: null },
    { name: "Profile", icon: User, route: "/profile" },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={["#7c3aed", "#d946ef", "#fb923c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-14 pb-8"
        >
          {/* Top Bar */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                <PieChart size={24} color="white" />
              </View>
              <View>
                <Text className="text-white/80 text-sm">Welcome back,</Text>
                <Text className="text-white font-semibold text-base">
                  {userName || "User"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity className="p-2 relative">
                <Bell size={24} color="white" />
                <View className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowThemeMenu(true)}
                className="p-2 bg-white/20 rounded-xl"
              >
                {isDark ? (
                  <Sun size={20} color="white" />
                ) : (
                  <Moon size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Portfolio Value Card */}
          <View className="bg-white/10 rounded-3xl p-6 border border-white/20">
            <Text className="text-white/80 text-sm mb-2">
              Total Portfolio Value
            </Text>
            <Text className="text-white text-4xl font-bold mb-3">
              ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Text>
            <View className="flex-row items-center gap-2">
              <TrendingUp size={20} color="#86efac" />
              <Text className="text-green-300 font-medium">
                +{todayChange.toLocaleString("en-IN", { minimumFractionDigits: 2 })} (+{todayChangePercent}%)
              </Text>
              <Text className="text-white/80 text-sm">Today</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <LinearGradient
          colors={["#d946ef", "#fb923c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-6 pb-8 pt-6"
        >
          <View className="flex-row justify-between">
            {[
              { icon: PlusCircle, label: "Invest", color: "#7c3aed", route: null },
              { icon: ArrowDownCircle, label: "Redeem", color: "#f97316", route: null },
              { icon: RefreshCw, label: "SIP", color: "#7c3aed", route: "/sip-dashboard" },
              { icon: ArrowUpCircle, label: "Switch", color: "#f97316", route: null },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                className="items-center gap-2"
                onPress={() => action.route && router.push(action.route as any)}
              >
                <View className="w-16 h-16 bg-white/90 rounded-2xl items-center justify-center shadow-lg">
                  <action.icon size={28} color={action.color} />
                </View>
                <Text className="text-xs text-white font-medium">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Holdings */}
        <View
          className="rounded-t-3xl px-6 pt-6 pb-6"
          style={{ backgroundColor: colors.cardBg }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              My Holdings
            </Text>
            <TouchableOpacity>
              <Text className="text-violet-600 font-medium text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {holdings.map((fund, index) => (
              <View
                key={index}
                className="rounded-2xl p-4 border"
                style={{
                  backgroundColor: isDark ? colors.inputBg : "#f5f3ff",
                  borderColor: isDark ? colors.border : "#ede9fe",
                }}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-2">
                    <Text
                      style={{ color: colors.text }}
                      className="font-semibold text-sm mb-1"
                    >
                      {fund.name}
                    </Text>
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="text-xs"
                    >
                      {fund.units.toFixed(2)} units • NAV ₹{fund.nav.toFixed(2)}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        fund.type === "Equity" ? "#7c3aed" : "#f97316",
                    }}
                  >
                    <Text className="text-white text-xs font-medium">
                      {fund.type}
                    </Text>
                  </View>
                </View>

                <View
                  className="flex-row items-center justify-between pt-3"
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: isDark ? colors.border : "#ede9fe",
                  }}
                >
                  <View>
                    <Text
                      style={{ color: colors.textSecondary }}
                      className="text-xs mb-1"
                    >
                      Current Value
                    </Text>
                    <Text
                      style={{ color: colors.text }}
                      className="font-bold text-lg"
                    >
                      ₹{fund.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View
                    className="flex-row items-center gap-1 px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        fund.change >= 0
                          ? isDark ? "#14532d" : "#dcfce7"
                          : isDark ? "#7f1d1d" : "#fee2e2",
                    }}
                  >
                    {fund.change >= 0 ? (
                      <TrendingUp size={16} color="#16a34a" />
                    ) : (
                      <TrendingDown size={16} color="#dc2626" />
                    )}
                    <Text
                      className="font-bold text-sm"
                      style={{
                        color: fund.change >= 0 ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {fund.change >= 0 ? "+" : ""}
                      {fund.change}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-6 left-6 right-6">
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          className="rounded-full overflow-hidden border border-white/40"
        >
          <View className="flex-row items-center justify-around px-4 py-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <TouchableOpacity
                  key={tab.name}
                  onPress={() => {
                    setActiveTab(tab.name);
                    if (tab.route) router.push(tab.route as any);
                  }}
                  className="items-center gap-1"
                >
                  <View className="w-12 h-12 rounded-full items-center justify-center">
                    {isActive ? (
                      <LinearGradient
                        colors={["#7c3aed", "#d946ef"]}
                        className="w-12 h-12 rounded-full items-center justify-center"
                      >
                        <tab.icon size={20} color="white" />
                      </LinearGradient>
                    ) : (
                      <tab.icon size={24} color={colors.textSecondary} />
                    )}
                  </View>
                  <Text
                    className="text-xs"
                    style={{
                      color: isActive ? "#7c3aed" : colors.textSecondary,
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>

      {/* Theme Modal */}
      <Modal
        visible={showThemeMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowThemeMenu(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: "absolute",
                  top: 110,
                  right: 20,
                  backgroundColor: colors.cardBg,
                  borderRadius: 14,
                  overflow: "hidden",
                  minWidth: 160,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 8,
                }}
              >
                {(
                  [
                    { label: "☀️  Light", value: "light" },
                    { label: "🌙  Dark", value: "dark" },
                    { label: "🔄  System", value: "system" },
                  ] as const
                ).map((opt, i, arr) => (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => {
                      setThemeMode(opt.value);
                      setShowThemeMenu(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 13,
                      borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                      borderBottomColor: colors.divider,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 14,
                        fontWeight: themeMode === opt.value ? "700" : "400",
                      }}
                    >
                      {opt.label}
                    </Text>
                    {themeMode === opt.value && (
                      <Check size={14} color="#7c3aed" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}