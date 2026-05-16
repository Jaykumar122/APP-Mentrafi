import { LinearGradient } from "expo-linear-gradient";
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
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

const activeSIPs = [
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

const pausedSIPs = [
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
      <LinearGradient
        colors={["#7c3aed", "#d946ef", "#fb923c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Blob */}
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: "rgba(249,168,212,0.5)",
          }}
        />

        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 52,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowLeft size={18} color="white" />
              </TouchableOpacity>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
                My SIPs
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => router.push("/sip-calculator" as any)}
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calculator size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 }}>
                Monthly SIP
              </Text>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                {formatINR(monthlySIP)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 }}>
                Total Invested
              </Text>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
                {formatINR(totalInvested)}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 30,
              padding: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("active")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 26,
                alignItems: "center",
                backgroundColor: activeTab === "active" ? "white" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: activeTab === "active" ? "#7c3aed" : "white",
                }}
              >
                Active ({activeSIPs.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("paused")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 26,
                alignItems: "center",
                backgroundColor: activeTab === "paused" ? "white" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: activeTab === "paused" ? "#7c3aed" : "white",
                }}
              >
                Paused ({pausedSIPs.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* SIP Cards */}
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.cardBg }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {sips.map((sip, index) => {
          const progress = (sip.completed / sip.total) * 100;
          return (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? colors.inputBg : "white",
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: isDark ? colors.border : "#f3f4f6",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Top Row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: "700",
                      marginBottom: 6,
                    }}
                  >
                    {sip.name}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        backgroundColor:
                          sip.type === "Equity" ? "#7c3aed" : "#f97316",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
                        {sip.type}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                      {sip.completed}/{sip.total} completed
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: isDark ? colors.bg : "#f9fafb",
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: isDark ? colors.border : "#e5e7eb",
                    }}
                  >
                    <Pencil size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: isDark ? colors.bg : "#f9fafb",
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: isDark ? colors.border : "#e5e7eb",
                    }}
                  >
                    <Pause size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Monthly + Next Date */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 2 }}>
                    Monthly Amount
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>
                    {formatINR(sip.monthlyAmount)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 2 }}>
                    Next Installment
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} color={colors.textSecondary} />
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>
                      {sip.nextDate}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View
                style={{
                  height: 5,
                  backgroundColor: isDark ? colors.border : "#f3f4f6",
                  borderRadius: 3,
                  marginBottom: 12,
                }}
              >
                <LinearGradient
                  colors={["#9333ea", "#ec4899"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 5,
                    borderRadius: 3,
                    width: `${progress}%`,
                  }}
                />
              </View>

              {/* Bottom Row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 2 }}>
                    Total Invested
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                    {formatINR(sip.totalInvested)}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 2 }}>
                    Current Value
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                    {formatINR(sip.currentValue)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: isDark ? "#14532d" : "#dcfce7",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <TrendingUp size={12} color="#16a34a" />
                  <Text style={{ color: "#16a34a", fontSize: 12, fontWeight: "700" }}>
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