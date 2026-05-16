import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Award,
  Bell,
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  Pencil,
  Settings,
  Shield,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react-native";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  badge?: string;
};

const accountItems: MenuItem[] = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "bank", label: "Bank & Payment Methods", icon: Wallet },
  { id: "kyc", label: "KYC Documents", icon: FileText, badge: "Verified" },
];

const preferenceItems: MenuItem[] = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Privacy", icon: Shield },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

function Section({
  title,
  children,
  colors,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
  isDark: boolean;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.2,
          marginBottom: 10,
          marginTop: 16,
        }}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: isDark ? colors.inputBg : "#faf5ff",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? colors.border : "#ede9fe",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function MenuRow({
  item,
  last,
  colors,
  isDark,
}: {
  item: MenuItem;
  last: boolean;
  colors: any;
  isDark: boolean;
}) {
  const Icon = item.icon;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: isDark ? colors.border : "#ede9fe",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? colors.bg : "#ede9fe",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Icon size={18} color="#7c3aed" />
      </View>
      <Text
        style={{
          flex: 1,
          color: colors.text,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {item.label}
      </Text>
      {item.badge && (
        <View
          style={{
            backgroundColor: "#dcfce7",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#16a34a", fontSize: 11, fontWeight: "700" }}>
            {item.badge}
          </Text>
        </View>
      )}
      <ChevronRight size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userName");
          router.replace("/(tabs)/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={["#7c3aed", "#d946ef", "#fb923c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Blobs */}
          <View
            style={{
              position: "absolute",
              top: -80,
              right: -60,
              width: 260,
              height: 260,
              borderRadius: 130,
              backgroundColor: "rgba(249,168,212,0.5)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 60,
              left: -40,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "rgba(236,72,153,0.3)",
            }}
          />

          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 52,
              paddingBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <ArrowLeft size={18} color="white" />
            </TouchableOpacity>

            <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
              Profile
            </Text>

            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Settings size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View style={{ alignItems: "center", paddingBottom: 28 }}>
            <View style={{ position: "relative", marginBottom: 12 }}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderWidth: 4,
                  borderColor: "rgba(255,255,255,0.5)",
                  overflow: "hidden",
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces",
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "#7c3aed",
                  borderWidth: 2,
                  borderColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil size={12} color="white" />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: "800",
                marginBottom: 4,
              }}
            >
              Jay Singh
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              Singhjay65521@gmail.com
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Award size={13} color="white" />
              <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>
                Premium Investor
              </Text>
            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 20,
                paddingHorizontal: 20,
              }}
            >
              {[
                {
                  label: "Portfolio",
                  value: "₹5.56L",
                  sub: "+18.4%",
                  isGreen: true,
                },
                {
                  label: "Active SIPs",
                  value: "3",
                  sub: "₹15,500/mo",
                  isGreen: false,
                },
                {
                  label: "Funds",
                  value: "12",
                  sub: "Holdings",
                  isGreen: false,
                },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "800",
                      marginBottom: 4,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {stat.isGreen && (
                      <TrendingUp size={10} color="#86efac" />
                    )}
                    <Text
                      style={{
                        color: stat.isGreen
                          ? "#86efac"
                          : "rgba(255,255,255,0.7)",
                        fontSize: 10,
                        fontWeight: "600",
                      }}
                    >
                      {stat.sub}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* White Card */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.cardBg,
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
        >
          <Section title="Account" colors={colors} isDark={isDark}>
            {accountItems.map((item, idx) => (
              <MenuRow
                key={item.id}
                item={item}
                last={idx === accountItems.length - 1}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </Section>

          <Section title="Preferences" colors={colors} isDark={isDark}>
            {preferenceItems.map((item, idx) => (
              <MenuRow
                key={item.id}
                item={item}
                last={idx === preferenceItems.length - 1}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </Section>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={{ marginTop: 24 }}
          >
            <LinearGradient
              colors={["#7c3aed", "#ec4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 20,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                shadowColor: "#7c3aed",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <LogOut size={18} color="white" />
              <Text
                style={{ color: "white", fontWeight: "700", fontSize: 15 }}
              >
                Log Out
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 20,
            }}
          >
            MentraFi v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}