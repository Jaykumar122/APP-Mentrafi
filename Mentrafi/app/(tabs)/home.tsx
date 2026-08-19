import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeftRight,
  ArrowDownCircle,
  Bell,
  Calculator,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  PieChart,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgGrad, Path, RadialGradient, Stop } from "react-native-svg";
import { API_URL } from "../../utils/api";
import BottomNav from "./BottomNav";
import {
  AuthBackground,
  C,
  cardTilt,
  depthShadow,
  FloatingSphere,
  GlowBackdrop,
} from "../(auth)/login";

// ---------------------------------------------------------------------------
// Types — mirror the shape returned by GET /api/portfolio and GET /api/funds
// ---------------------------------------------------------------------------
type Holding = {
  id: string;
  name: string;
  units: number;
  value: number;
  change: number; // 1Y return %
};

type MarketFund = {
  name: string;
  category: string;
  change: number;
  rating: number;
};

type PortfolioSummary = {
  totalValue: number;
  investedValue: number;
  gainValue: number;
  gainPercent: number;
  todayChange: number;
  todayChangePercent: number;
  xirr: number;
  holdings: Holding[];
};

// Compact Indian-style number formatting: 245680.5 -> "2.46L", 12500000 -> "1.25Cr"
function formatCompact(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${(value / 1e7).toFixed(decimals)}Cr`;
  if (abs >= 1e5) return `${(value / 1e5).toFixed(decimals)}L`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

const GREEN = "#4ade80";
const RED = "#ff6b81";

// ---------------------------------------------------------------------------
// COIN STACK ICON — isometric extruded coin stack, built the same way as
// LockIcon / BadgeIcon (front/top/side faces + gradient sheen)
// ---------------------------------------------------------------------------
function CoinStackIcon() {
  return (
    <Svg width="130" height="130" viewBox="0 0 150 150">
      <Defs>
        <SvgGrad id="coinTop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ffe9a8" />
          <Stop offset="100%" stopColor="#ffcf6e" />
        </SvgGrad>
        <SvgGrad id="coinSide" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#c9932e" />
          <Stop offset="100%" stopColor="#8a5e18" />
        </SvgGrad>
        <SvgGrad id="coinTop2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ff9dbc" />
          <Stop offset="100%" stopColor={C.pink} />
        </SvgGrad>
        <SvgGrad id="coinSide2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#b23360" />
          <Stop offset="100%" stopColor="#7a1f42" />
        </SvgGrad>
        <SvgGrad id="coinTop3" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#c9b3ff" />
          <Stop offset="100%" stopColor={C.violet} />
        </SvgGrad>
        <SvgGrad id="coinSide3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#5a34a8" />
          <Stop offset="100%" stopColor="#3c2170" />
        </SvgGrad>
      </Defs>

      {/* bottom coin — violet */}
      <Ellipse cx="75" cy="104" rx="42" ry="14" fill="url(#coinSide3)" />
      <Ellipse cx="75" cy="97" rx="42" ry="14" fill="url(#coinTop3)" />
      <Ellipse cx="75" cy="97" rx="30" ry="9" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />

      {/* middle coin — pink */}
      <Ellipse cx="75" cy="82" rx="42" ry="14" fill="url(#coinSide2)" />
      <Ellipse cx="75" cy="75" rx="42" ry="14" fill="url(#coinTop2)" />
      <Ellipse cx="75" cy="75" rx="30" ry="9" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />

      {/* top coin — gold */}
      <Ellipse cx="75" cy="60" rx="42" ry="14" fill="url(#coinSide)" />
      <Ellipse cx="75" cy="53" rx="42" ry="14" fill="url(#coinTop)" />
      <Ellipse cx="75" cy="53" rx="30" ry="9" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* rupee glyph on the top coin */}
      <Path
        d="M64 47 h20 M64 52 h20 M64 47 q12 0 12 8 q0 8 -12 8 h-6 l18 12"
        stroke="#8a5e18"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* highlight sheen */}
      <Ellipse cx="60" cy="49" rx="10" ry="4" fill="#fff" opacity="0.4" />
    </Svg>
  );
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={11} color={C.pink} fill={i <= rounded ? C.pink : "transparent"} strokeWidth={1.5} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Glass card wrapper — the same translucent material used for login/signup
// inputs, reused here for every panel on the page
// ---------------------------------------------------------------------------
function GlassPanel({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={{
        backgroundColor: C.input,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 20,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

// This screen is always "Home" — computing active state from a local
// variable (instead of mutable useState) avoids a bug where clicking a
// different tab set this screen's own state to the destination tab's name
// right before navigating away, so if this screen instance was reused
// later (router.push keeps old screens mounted), the wrong tab stayed
// highlighted.
const CURRENT_TAB = "Home";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [marketPulse, setMarketPulse] = useState<MarketFund[]>([]);
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

  async function fetchMarketPulse() {
    try {
      const res = await fetch(`${API_URL}/api/funds?limit=3`);
      if (!res.ok) return;
      const data = await res.json();
      setMarketPulse(
        (data.funds || []).map((f: any) => ({
          name: f.name,
          category: f.category,
          change: Number(f.oneYearReturn ?? 0),
          rating: Number(f.rating ?? 4),
        }))
      );
    } catch (err) {
      console.error("Market pulse fetch error:", err);
    }
  }

  useEffect(() => {
    AsyncStorage.getItem("userName").then((name) => {
      if (name) setUserName(name);
    });
    fetchPortfolio();
    fetchMarketPulse();
  }, []);

  const totalValue = portfolio?.totalValue ?? 0;
  const todayChange = portfolio?.todayChange ?? 0;
  const todayChangePercent = portfolio?.todayChangePercent ?? 0;
  const investedValue = `₹${formatCompact(portfolio?.investedValue ?? 0, 2)}`;
  const gainValue = `${(portfolio?.gainValue ?? 0) >= 0 ? "+" : "-"}₹${formatCompact(
    Math.abs(portfolio?.gainValue ?? 0),
    1
  )}`;
  const xirrValue = `${(portfolio?.xirr ?? 0).toFixed(1)}%`;
  const holdings = (portfolio?.holdings ?? []).slice(0, 5);
  const isTodayPositive = todayChangePercent >= 0;
  const isGainPositive = (portfolio?.gainValue ?? 0) >= 0;

  const tabs = [
    { name: "Home", icon: Home, route: "/home" },
    { name: "Explore", icon: Search, route: "/explore" },
    { name: "Portfolio", icon: PieChart, route: "/portfolio" },
    { name: "AI Advisor", icon: Sparkles, route: "/ai-advisor" },
    { name: "Profile", icon: User, route: "/profile" },
  ];

  const quickActions = [
    { icon: PlusCircle, label: "Invest", route: null },
    { icon: ArrowDownCircle, label: "Redeem", route: null },
    { icon: RefreshCw, label: "SIP", route: "/sip-dashboard" },
    { icon: ArrowLeftRight, label: "Switch", route: null },
  ];

  const initials = (userName || "Rajesh Kumar")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Top bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ position: "relative" }}>
              <LinearGradient
                colors={[C.pink, C.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  ...depthShadow("sm"),
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>{initials}</Text>
              </LinearGradient>
              <View
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 13,
                  height: 13,
                  borderRadius: 7,
                  backgroundColor: GREEN,
                  borderWidth: 2,
                  borderColor: C.bgBottom,
                }}
              />
            </View>
            <View>
              <Text style={{ color: C.textMuted, fontSize: 12 }}>Good morning 👋</Text>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {userName || "Rajesh Kumar"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: C.input,
              borderWidth: 1,
              borderColor: C.inputBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={18} color="#fff" />
            <View
              style={{
                position: "absolute",
                top: 9,
                right: 11,
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: C.cyan,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Portfolio hero — same tilted glass card + glow + isometric icon
            construction as the login/signup cards */}
        <View style={{ paddingHorizontal: 16, marginBottom: 26 }}>
          <View style={{ ...depthShadow("lg"), ...cardTilt }}>
            <LinearGradient
              colors={[C.card, "#050508"]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={{
                borderRadius: 32,
                borderWidth: 1,
                borderColor: C.cardEdge,
                overflow: "hidden",
                paddingBottom: 22,
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: -40,
                  left: -60,
                  width: 140,
                  height: 500,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  transform: [{ rotate: "18deg" }],
                }}
              />

              <View style={{ height: 150, alignItems: "center", justifyContent: "flex-end" }}>
                <View style={{ position: "absolute", bottom: 0 }}>
                  <GlowBackdrop from={C.pink} to={C.violet} />
                </View>
                <View style={{ marginBottom: 8, ...depthShadow("md") }}>
                  <CoinStackIcon />
                </View>
              </View>

              <View style={{ paddingHorizontal: 26 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.pink }} />
                    <Text style={{ color: C.pink, fontSize: 11, fontWeight: "700", letterSpacing: 1.2 }}>
                      PORTFOLIO
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowBalance((s) => !s)}>
                    {showBalance ? (
                      <Eye size={16} color={C.textMuted} />
                    ) : (
                      <EyeOff size={16} color={C.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={{ color: "#fff", fontSize: 32, fontWeight: "700", marginBottom: 8 }}>
                  {showBalance
                    ? `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "₹••••••••"}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 }}>
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

                <Svg width="100%" height={44} viewBox="0 0 300 44">
                  <Defs>
                    <SvgGrad id="sparkline" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0%" stopColor={C.pink} />
                      <Stop offset="100%" stopColor={C.violet} />
                    </SvgGrad>
                  </Defs>
                  <Path
                    d="M0,32 L25,28 L50,34 L75,20 L100,24 L125,12 L150,18 L175,8 L200,14 L225,6 L250,10 L275,3 L300,8"
                    stroke="url(#sparkline)"
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingTop: 16,
                    marginTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: C.inputBorder,
                  }}
                >
                  <View>
                    <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 3 }}>Invested</Text>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{investedValue}</Text>
                  </View>
                  <View>
                    <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 3 }}>Gain</Text>
                    <Text style={{ color: isGainPositive ? GREEN : RED, fontWeight: "700", fontSize: 14 }}>{gainValue}</Text>
                  </View>
                  <View>
                    <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 3 }}>XIRR</Text>
                    <Text style={{ color: C.cyan, fontWeight: "700", fontSize: 14 }}>{xirrValue}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Quick actions — glass tiles with gradient icon chips */}
        <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={{ alignItems: "center", gap: 8 }}
                onPress={() => action.route && router.push(action.route as any)}
              >
                <GlassPanel style={{ width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: 20 }}>
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" }}
                  >
                    <action.icon size={19} color="#fff" />
                  </LinearGradient>
                </GlassPanel>
                <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: "500" }}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Market Pulse */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>Market Pulse</Text>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text style={{ color: C.cyan, fontWeight: "600", fontSize: 13 }}>Explore</Text>
              <ChevronRight size={14} color={C.cyan} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {marketPulse.map((fund) => (
              <GlassPanel key={fund.name} style={{ padding: 16, width: 168 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <StarRow rating={fund.rating} />
                  <View
                    style={{
                      backgroundColor: "rgba(74,222,128,0.15)",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ color: GREEN, fontSize: 11, fontWeight: "700" }}>+{fund.change}%</Text>
                  </View>
                </View>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13, marginBottom: 4 }}>{fund.name}</Text>
                <Text style={{ color: C.textFaint, fontSize: 12 }}>{fund.category}</Text>
              </GlassPanel>
            ))}
          </ScrollView>
        </View>

        {/* Holdings */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>My Holdings</Text>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text style={{ color: C.cyan, fontWeight: "600", fontSize: 13 }}>View All</Text>
              <ChevronRight size={14} color={C.cyan} />
            </TouchableOpacity>
          </View>

          <GlassPanel style={{ overflow: "hidden" }}>
            {holdings.length === 0 && !loading && (
              <View style={{ paddingHorizontal: 16, paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ color: C.textFaint, fontSize: 13, textAlign: "center" }}>
                  You do not have any holdings yet.{"\n"}Explore funds to start investing.
                </Text>
              </View>
            )}
            {holdings.map((fund, index) => {
              const positive = fund.change >= 0;
              return (
                <TouchableOpacity
                  key={fund.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderBottomWidth: index < holdings.length - 1 ? 1 : 0,
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
                      backgroundColor: "rgba(212,175,55,0.16)",
                    }}
                  >
                    {positive ? (
                      <TrendingUp size={16} color="#D4AF37" />
                    ) : (
                      <TrendingDown size={16} color="#D4AF37" />
                    )}
                  </View>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13, marginBottom: 2 }} numberOfLines={1}>
                      {fund.name}
                    </Text>
                    <Text style={{ color: C.textFaint, fontSize: 11 }}>{fund.units.toFixed(2)} units</Text>
                  </View>

                  <View style={{ alignItems: "flex-end", marginRight: 8 }}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                      ₹{fund.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={{ color: positive ? GREEN : RED, fontSize: 11, fontWeight: "600" }}>
                      {positive ? "+" : ""}
                      {fund.change}%
                    </Text>
                  </View>

                  <ChevronRight size={16} color={C.textFaint} />
                </TouchableOpacity>
              );
            })}
          </GlassPanel>

          {/* SIP Calculator banner */}
          <TouchableOpacity onPress={() => router.push("/sip-dashboard" as any)} style={{ marginTop: 14, ...depthShadow("sm") }}>
            <LinearGradient
              colors={[C.pink, C.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 20,
                padding: 16,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Calculator size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>SIP Calculator</Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
                  See how your SIP grows over time
                </Text>
              </View>
              <ChevronRight size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation — shared component */}
      <BottomNav tabs={tabs} paddingBottom={26} />
    </View>
  );
}