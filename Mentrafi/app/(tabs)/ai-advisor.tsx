import { useRouter } from "expo-router";
import {
  ChevronDown,
  Home,
  PieChart,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  User,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

// ---------------------------------------------------------------------------
// Brand palette — matches the redesigned home & profile screens.
// ---------------------------------------------------------------------------
const NAVY = "#12131c";
const NAVY_SOFT = "rgba(255,255,255,0.10)";
const NAVY_BORDER = "rgba(255,255,255,0.18)";
const GOLD = "#D4AF37";
const GOLD_SOFT = "rgba(212,175,55,0.14)";
const GOLD_BORDER = "rgba(212,175,55,0.35)";
const GOLD_TEXT = "#8a6d1f";

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
};

const suggestions = [
  "Which fund is best for beginners?",
  "I want safe, low-risk funds",
  "Help me save tax with ELSS",
  "Best SIP funds right now",
  "I want aggressive growth",
  "Recommend an index fund",
];

const WELCOME_MESSAGE =
  "Hi! I'm Mentrafi AI — your personal fund advisor. Tell me your investment goal, risk appetite, or just ask anything about mutual funds.";

export default function AIAdvisorScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("AI Advisor");
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "ai", text: WELCOME_MESSAGE },
  ]);

  const tabs = [
    { name: "Home", icon: Home, route: "/home" },
    { name: "Explore", icon: Search, route: "/explore" },
    { name: "Portfolio", icon: PieChart, route: "/portfolio" },
    { name: "AI Advisor", icon: Sparkles, route: "/ai-advisor" },
    { name: "Profile", icon: User, route: "/profile" },
  ];

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-u`, role: "user", text: trimmed },
    ]);
    setInputText("");
    setShowSuggestions(false);

    // Placeholder response — swap for the real GPT-4o call.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          role: "ai",
          text: "Let me look into that for you — this is where Mentrafi AI's response will appear.",
        },
      ]);
    }, 500);
  };

  const resetChat = () => {
    setMessages([{ id: "welcome", role: "ai", text: WELCOME_MESSAGE }]);
    setShowSuggestions(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: NAVY,
            paddingTop: 52,
            paddingBottom: 18,
            paddingHorizontal: 20,
            overflow: "hidden",
          }}
        >
          {/* decorative gold blob */}
          <View
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "rgba(212,175,55,0.55)",
            }}
          />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  borderWidth: 1,
                  borderColor: GOLD_BORDER,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={20} color={GOLD} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  Mentrafi AI Advisor
                </Text>
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <View style={{ backgroundColor: GOLD }} className="w-1.5 h-1.5 rounded-full" />
                  <Text style={{ color: "rgba(255,255,255,0.6)" }} className="text-xs">
                    Online · Powered by GPT-4o
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={resetChat}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: NAVY_SOFT,
                borderWidth: 1,
                borderColor: NAVY_BORDER,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat body */}
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.bg }}
          contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) =>
            msg.role === "ai" ? (
              <View key={msg.id} className="flex-row items-start gap-2.5 mb-5">
                <View
                  style={{ backgroundColor: GOLD_SOFT, borderColor: GOLD_BORDER }}
                  className="w-9 h-9 rounded-full items-center justify-center border"
                >
                  <Sparkles size={16} color={GOLD} />
                </View>
                <View
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                  className="flex-1 rounded-2xl rounded-tl-md p-4 border"
                >
                  <Text style={{ color: colors.text }} className="text-sm leading-5">
                    {msg.text}
                  </Text>
                </View>
              </View>
            ) : (
              <View key={msg.id} className="items-end mb-5">
                <View
                  style={{ backgroundColor: NAVY }}
                  className="max-w-[85%] rounded-2xl rounded-tr-md px-4 py-3"
                >
                  <Text className="text-white text-sm leading-5">{msg.text}</Text>
                </View>
              </View>
            )
          )}

          {showSuggestions && (
            <View className="mt-1">
              <TouchableOpacity
                onPress={() => setShowSuggestions((s) => !s)}
                className="flex-row items-center gap-1.5 mb-3"
              >
                <ChevronDown size={15} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
                  Try asking:
                </Text>
              </TouchableOpacity>

              <View className="flex-row flex-wrap gap-2">
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => sendMessage(s)}
                    style={{ backgroundColor: GOLD_SOFT, borderColor: GOLD_BORDER }}
                    className="px-4 py-2.5 rounded-full border"
                  >
                    <Text style={{ color: isDark ? GOLD : GOLD_TEXT }} className="text-xs font-medium">
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={{ backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 8 }}>
          <View
            style={{ backgroundColor: colors.inputBg, borderColor: colors.border }}
            className="flex-row items-center rounded-full border px-2 py-1.5"
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about any fund or goal..."
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text, flex: 1, fontSize: 14, paddingHorizontal: 12 }}
              onSubmitEditing={() => sendMessage(inputText)}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={() => sendMessage(inputText)}
              style={{ backgroundColor: GOLD }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Send size={16} color={NAVY} />
            </TouchableOpacity>
          </View>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-center text-[11px] mt-2 mb-2"
          >
            AI suggestions are not financial advice.
          </Text>
        </View>

        {/* Bottom Navigation */}
        <View
          style={{ backgroundColor: colors.cardBg, borderTopColor: colors.divider }}
          className="flex-row items-center justify-around px-2 pt-2 pb-2 border-t"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}