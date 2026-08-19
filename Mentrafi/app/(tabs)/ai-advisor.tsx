import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";
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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../utils/api";
import BottomNav from "./BottomNav";
import { AuthBackground, C, depthShadow } from "../(auth)/login";

// ---------------------------------------------------------------------------
// Backend URL comes from utils/api.ts (handles Android emulator vs
// physical device vs iOS automatically). See API_URL import above.
// ---------------------------------------------------------------------------

type RecommendedFund = {
  id: string;
  schemeCode?: number;
  name: string;
  category: string;
  subcategory: string;
  rating: number;
  oneYearReturn: number | null;
  fiveYearReturn: number | null;
  nav: number | null;
};

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
  recommendedFunds?: RecommendedFund[];
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

const GREEN = "#4ade80";

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Sparkles key={i} size={12} color={i <= rounded ? C.pink : C.textFaint} />
      ))}
    </View>
  );
}

function RecommendedFundCard({ fund }: { fund: RecommendedFund }) {
  return (
    <View
      style={{
        backgroundColor: C.input,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 20,
        padding: 16,
        marginTop: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginBottom: 2 }}>
            {fund.name}
          </Text>
          <Text style={{ color: C.textFaint, fontSize: 12 }}>
            {fund.category} · {fund.subcategory}
          </Text>
        </View>
        <StarRow rating={fund.rating} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <View>
            <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>1Y Return</Text>
            <Text style={{ color: GREEN, fontWeight: "700", fontSize: 13 }}>
              {fund.oneYearReturn != null ? `+${fund.oneYearReturn}%` : "—"}
            </Text>
          </View>
          <View>
            <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>5Y Return</Text>
            <Text style={{ color: fund.fiveYearReturn != null ? GREEN : C.textFaint, fontWeight: "700", fontSize: 13 }}>
              {fund.fiveYearReturn != null ? `+${fund.fiveYearReturn}%` : "—"}
            </Text>
          </View>
          <View>
            <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>NAV</Text>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
              {fund.nav != null ? `₹${fund.nav.toFixed(2)}` : "—"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AIAdvisorScreen() {
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
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

  // -------------------------------------------------------------------------
  // Streaming sendMessage — hits /api/advisor/chat/stream (SSE) and fills in
  // the AI bubble's text progressively as chunks arrive, using XHR since
  // fetch's streaming body reader isn't reliably supported in React Native.
  // -------------------------------------------------------------------------
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-u`, role: "user", text: trimmed },
    ]);
    setInputText("");
    setShowSuggestions(false);
    setIsTyping(true);

    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          role: "ai",
          text: "You need to be logged in for me to give personalized recommendations. Please log in and try again.",
        },
      ]);
      setIsTyping(false);
      return;
    }

    const aiMessageId = `${Date.now()}-ai`;
    let hasStartedStreaming = false;
    let accumulatedText = "";
    let lastProcessedLength = 0;
    let sseBuffer = "";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/api/advisor/chat/stream`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    // Local LLMs on CPU can be slow (a full response can take 40-60s+).
    // Timeout is set generously above that so slow-but-working responses
    // aren't killed early; the backend also sends SSE heartbeats so the
    // OS-level connection doesn't get reaped as "idle" while we wait.
    xhr.timeout = 120000;

    xhr.onprogress = () => {
      const newText = xhr.responseText.slice(lastProcessedLength);
      lastProcessedLength = xhr.responseText.length;

      // XHR progress events can split one SSE JSON line across multiple
      // packets. Preserve the unfinished tail instead of discarding it and
      // silently losing words/cards when JSON.parse sees only half a chunk.
      sseBuffer += newText;
      const lines = sseBuffer.split("\n");
      sseBuffer = lines.pop() || "";
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith("data:")) continue;
        const jsonStr = trimmedLine.slice(5).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const hasFunds = Array.isArray(parsed.recommendedFunds) && parsed.recommendedFunds.length > 0;
          if (hasFunds) {
            if (!hasStartedStreaming) {
              hasStartedStreaming = true;
              setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", text: "", recommendedFunds: parsed.recommendedFunds }]);
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId ? { ...m, recommendedFunds: parsed.recommendedFunds } : m
                )
              );
            }
          }

          if (typeof parsed.chunk === "string") {
            if (!hasStartedStreaming) {
              hasStartedStreaming = true;
              setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", text: "" }]);
            }
            accumulatedText += parsed.chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId ? { ...m, text: accumulatedText } : m
              )
            );
          }
        } catch {
          // incomplete JSON chunk, wait for more data
        }
      }
    };

    xhr.onerror = () => {
      setIsTyping(false);
      const errorText = hasStartedStreaming
        ? "Lost connection to the advisor partway through. Here's what I got so far — feel free to ask again."
        : "Couldn't reach the advisor. Make sure the backend and LM Studio are running, and that your device is on the same network.";
      if (hasStartedStreaming) {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, text: m.text || errorText } : m))
        );
      } else {
        setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", text: errorText }]);
      }
    };

    xhr.ontimeout = () => {
      setIsTyping(false);
      const timeoutText = "The advisor is taking too long to respond. Make sure the LM Studio server is running and try again.";
      if (hasStartedStreaming) {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, text: m.text || timeoutText } : m))
        );
      } else {
        setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", text: timeoutText }]);
      }
    };

    xhr.onload = () => {
      setIsTyping(false);
      if (!accumulatedText) {
        const fallbackText = "Sorry, I couldn't generate a recommendation right now.";
        if (hasStartedStreaming) {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMessageId ? { ...m, text: fallbackText } : m))
          );
        } else {
          setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", text: fallbackText }]);
        }
      }
    };

    xhr.send(JSON.stringify({ message: trimmed }));
  };

  const resetChat = () => {
    setMessages([{ id: "welcome", role: "ai", text: WELCOME_MESSAGE }]);
    setShowSuggestions(true);
    setIsTyping(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* Header — same glass-card material as the profile hero */}
          <LinearGradient
            colors={[C.card, "#050508"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
              paddingTop: 52,
              paddingBottom: 18,
              paddingHorizontal: 20,
              overflow: "hidden",
              borderBottomWidth: 1,
              borderColor: C.cardEdge,
            }}
          >
            {/* decorative glow blob */}
            <View
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "rgba(255,79,129,0.25)",
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <LinearGradient
                  colors={[C.pink, C.violet]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                    ...depthShadow("sm"),
                  }}
                >
                  <Sparkles size={20} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                    Mentrafi AI Advisor
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.cyan }} />
                    <Text style={{ color: C.textMuted, fontSize: 12 }}>
                      {isTyping ? "Thinking..." : "Online · Local AI"}
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
                  backgroundColor: C.input,
                  borderWidth: 1,
                  borderColor: C.inputBorder,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RefreshCw size={16} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Chat body */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) =>
              msg.role === "ai" ? (
                <View key={msg.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles size={16} color="#fff" />
                  </LinearGradient>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: C.input,
                      borderColor: C.inputBorder,
                      borderWidth: 1,
                      borderRadius: 20,
                      borderTopLeftRadius: 6,
                      padding: 16,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 14, lineHeight: 20 }}>{msg.text}</Text>
                    {msg.recommendedFunds?.length ? (
                      <View style={{ marginTop: 4 }}>
                        {msg.recommendedFunds.map((fund) => (
                          <RecommendedFundCard key={fund.id} fund={fund} />
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : (
                <View key={msg.id} style={{ alignItems: "flex-end", marginBottom: 20 }}>
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      maxWidth: "85%",
                      borderRadius: 20,
                      borderTopRightRadius: 6,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 14, lineHeight: 20 }}>{msg.text}</Text>
                  </LinearGradient>
                </View>
              )
            )}

            {isTyping && (
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
                <LinearGradient
                  colors={[C.pink, C.violet]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={16} color="#fff" />
                </LinearGradient>
                <View
                  style={{
                    backgroundColor: C.input,
                    borderColor: C.inputBorder,
                    borderWidth: 1,
                    borderRadius: 20,
                    borderTopLeftRadius: 6,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <ActivityIndicator size="small" color={C.pink} />
                </View>
              </View>
            )}

            {showSuggestions && (
              <View style={{ marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setShowSuggestions((s) => !s)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}
                >
                  <ChevronDown size={15} color={C.textMuted} />
                  <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: "500" }}>Try asking:</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {suggestions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => sendMessage(s)}
                      disabled={isTyping}
                      style={{
                        backgroundColor: "rgba(255,79,129,0.12)",
                        borderWidth: 1,
                        borderColor: "rgba(255,79,129,0.3)",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ color: C.pink, fontSize: 12, fontWeight: "500" }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input bar */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: C.input,
                borderColor: C.inputBorder,
                borderWidth: 1,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about any fund or goal..."
                placeholderTextColor={C.textFaint}
                editable={!isTyping}
                style={{ color: "#fff", flex: 1, fontSize: 14, paddingHorizontal: 12 }}
                onSubmitEditing={() => sendMessage(inputText)}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={() => sendMessage(inputText)}
                disabled={isTyping}
                style={{ opacity: isTyping ? 0.5 : 1 }}
              >
                <LinearGradient
                  colors={[C.pink, C.violet]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Send size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={{ color: C.textFaint, textAlign: "center", fontSize: 11, marginTop: 8, marginBottom: 8 }}>
              AI suggestions are not financial advice.
            </Text>
          </View>

          {/* Bottom Navigation — shared component */}
          <BottomNav tabs={tabs} paddingBottom={10} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}