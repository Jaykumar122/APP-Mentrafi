import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────
const C = {
  navy: "#0d1b2a",
  gold: "#b8943a",
  goldFaint: "rgba(184,148,58,0.14)",
  white06: "rgba(255,255,255,0.06)",
  white08: "rgba(255,255,255,0.08)",
  white10: "rgba(255,255,255,0.10)",
  white20: "rgba(255,255,255,0.20)",
  white30: "rgba(255,255,255,0.30)",
  white40: "rgba(255,255,255,0.40)",
  white42: "rgba(255,255,255,0.42)",
  white60: "rgba(255,255,255,0.60)",
  green: "#22c55e",
};

const titleFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: undefined,
});

// ─────────────────────────────────────────────
// SLIDE DATA
// ─────────────────────────────────────────────
const SLIDES = [
  {
    id: "1",
    tag: "SMART INVESTING",
    headline: "Grow wealth\nwith expert-\nmanaged funds.",
    sub: "Access 60+ SEBI-registered mutual funds curated by top fund managers across equity, debt and hybrid categories.",
    statVal: "+26.2%",
    statLabel: "Top 1Y Return",
    badgeVal: "₹84,200 Cr",
    badgeLabel: "Assets Under Management",
  },
  {
    id: "2",
    tag: "START SMALL",
    headline: "SIP from just\n₹500 a month.\nAnytime.",
    sub: "Set up automatic monthly investments and let compounding work silently over time. Cancel or pause whenever you want.",
    statVal: "2.4M+",
    statLabel: "Active Investors",
    badgeVal: "₹500/mo",
    badgeLabel: "Minimum SIP amount",
  },
  {
    id: "3",
    tag: "AI-POWERED ADVICE",
    headline: "Ask our AI.\nGet the right\nfund for you.",
    sub: "Mentrafi AI analyses your goals, risk appetite, and investment horizon to recommend the perfect fund — instantly.",
    statVal: "98.2%",
    statLabel: "Recommendation accuracy",
    badgeVal: "GPT-4o",
    badgeLabel: "Powered by Mentrafi AI",
  },
];

// ─────────────────────────────────────────────
// DECORATIVE CIRCLES (per slide)
// ─────────────────────────────────────────────
function SlideDecorations() {
  return (
    <>
      {/* Radial glow top-right */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: "rgba(184,148,58,0.15)",
        }}
      />
      {/* Large solid gold circle */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: C.gold,
          opacity: 0.9,
        }}
      />
      {/* Ghost circle mid-right */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 160,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: C.white06,
          borderWidth: 1,
          borderColor: C.white10,
        }}
      />
      {/* Gold-tinted circle mid-left */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 200,
          left: -56,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: C.gold,
          opacity: 0.08,
        }}
      />
      {/* Ring bottom-left */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 120,
          left: -44,
          width: 110,
          height: 110,
          borderRadius: 55,
          borderWidth: 1,
          borderColor: "rgba(184,148,58,0.14)",
        }}
      />
      {/* Dot accents */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 110,
          left: 34,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: C.gold,
          opacity: 0.44,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 138,
          left: 58,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: C.gold,
          opacity: 0.24,
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// SLIDE 1 — Line Chart Visual
// ─────────────────────────────────────────────
function Slide1Card() {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        marginBottom: 16,
      }}
    >
      {/* Card header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              color: "rgba(255,255,255,0.40)",
              fontSize: 10,
              marginBottom: 4,
            }}
          >
            Mentrafi Large Cap · FY 2024
          </Text>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
            Annual Performance
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#b8943a", fontSize: 22, fontWeight: "700" }}>
            +26.2%
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 10,
              marginTop: 1,
            }}
          >
            1Y return
          </Text>
        </View>
      </View>

      {/* Line chart */}
      <View
        style={{
          height: 100,
          marginBottom: 0,
          marginTop: 8,
        }}
      >
        <Svg width="100%" height="100" viewBox="0 0 300 100">
          {/* Smooth growth curve */}
          <Path
            d="M 10,85 Q 40,75 75,65 T 140,45 T 205,30 T 270,20"
            stroke="#b8943a"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// SLIDE 2 — SIP List Visual
// ─────────────────────────────────────────────
function Slide2Card() {
  const sips = [
    {
      fund: "Mentrafi Large Cap",
      sip: "₹2,000/mo",
      dur: "3 yrs",
      val: "₹86,240",
      gain: "+23.3%",
    },
    {
      fund: "Pinnacle Balanced",
      sip: "₹1,500/mo",
      dur: "2 yrs",
      val: "₹39,800",
      gain: "+19.2%",
    },
    {
      fund: "Crestline Debt Fund",
      sip: "₹500/mo",
      dur: "1 yr",
      val: "₹6,312",
      gain: "+8.4%",
    },
  ];

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: "rgba(184,148,58,0.18)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <RefreshCw size={14} color={C.gold} />
        </View>
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>
          Active SIPs
        </Text>
      </View>

      {sips.map((item, i) => (
        <View key={i}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#fff", fontSize: 12, fontWeight: "600", marginBottom: 2 }}
              >
                {item.fund}
              </Text>
              <Text
                style={{ color: "rgba(255,255,255,0.36)", fontSize: 10 }}
              >
                {item.sip} · {item.dur}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{ color: "#b8943a", fontSize: 13, fontWeight: "600" }}
              >
                {item.val}
              </Text>
              <Text
                style={{ color: "#22c55e", fontSize: 10, marginTop: 1 }}
              >
                {item.gain}
              </Text>
            </View>
          </View>
          {i < sips.length - 1 && (
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.07)",
              }}
            />
          )}
        </View>
      ))}

      {/* Total */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>
          Total SIP value
        </Text>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          ₹1,32,352
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// SLIDE 3 — AI Advisor Preview
// ─────────────────────────────────────────────
function Slide3Card() {
  const funds = [
    {
      name: "Mentrafi Large Cap",
      match: 97,
      risk: "Mod. High",
      ret: "+26.2%",
    },
    { name: "Summit Nifty 50 Index", match: 89, risk: "Moderate", ret: "+19.3%" },
  ];

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        marginBottom: 16,
      }}
    >
      {/* AI header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: "rgba(184,148,58,0.18)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Sparkles size={14} color={C.gold} />
        </View>
        <View>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>
            Mentrafi AI says:
          </Text>
          <Text
            style={{ color: "rgba(255,255,255,0.38)", fontSize: 10 }}
          >
            Based on your 5-year growth goal
          </Text>
        </View>
      </View>

      {/* AI message bubble */}
      <View
        style={{
          backgroundColor: "rgba(184,148,58,0.10)",
          borderRadius: 14,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "rgba(184,148,58,0.20)",
        }}
      >
        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          I recommend{" "}
          <Text style={{ color: "#b8943a", fontWeight: "600" }}>
            Mentrafi Large Cap
          </Text>
          {" "}(70%) and{" "}
          <Text style={{ color: "#b8943a", fontWeight: "600" }}>
            Nifty 50 Index
          </Text>
          {" "}(30%) for your portfolio.
        </Text>
      </View>

      {/* Fund cards */}
      {funds.map((f, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: 10,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.09)",
            marginBottom: i < funds.length - 1 ? 8 : 0,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: "#fff", fontSize: 11, fontWeight: "600", marginBottom: 2 }}
            >
              {f.name}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.36)", fontSize: 9 }}>
              {f.risk}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <View
              style={{
                backgroundColor: "rgba(184,148,58,0.18)",
                borderRadius: 10,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderWidth: 1,
                borderColor: "rgba(184,148,58,0.28)",
              }}
            >
              <Text style={{ color: "#b8943a", fontSize: 9, fontWeight: "600" }}>
                {f.match}% match
              </Text>
            </View>
            <Text style={{ color: "#b8943a", fontSize: 12, fontWeight: "600" }}>
              {f.ret}
            </Text>
          </View>
        </View>
      ))}

      {/* Metrics row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.08)",
        }}
      >
        {[
          { label: "Match", val: "97%" },
          { label: "Risk", val: "Mod." },
          { label: "Horizon", val: "5Y+" },
        ].map(({ label, val }) => (
          <View key={label} style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 9,
                marginBottom: 3,
              }}
            >
              {label}
            </Text>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              {val}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// SINGLE SLIDE
// ─────────────────────────────────────────────
function Slide({
  item,
  index,
  currentIndex,
  onSkip,
}: {
  item: (typeof SLIDES)[0];
  index: number;
  currentIndex: number;
  onSkip: () => void;
}) {
  return (
    <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
      <SlideDecorations />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: Platform.OS === "android" ? 60 : 50,
          paddingBottom: 24,
        }}
      >
        {/* Logo/Brand mark + Skip button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: C.gold,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(184,148,58,0.08)",
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  borderWidth: 1.5,
                  borderColor: C.gold,
                }}
              />
            </View>
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
                fontFamily: titleFont,
              }}
            >
              Mentrafi
            </Text>
          </View>

          {/* Skip button - inline */}
          {index < SLIDES.length - 1 && (
            <TouchableOpacity
              onPress={onSkip}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 14,
                paddingVertical: 7,
                backgroundColor: "rgba(184,148,58,0.20)",
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>
                Skip
              </Text>
              <ArrowRight size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tag */}
        <View
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "rgba(184,148,58,0.15)",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderWidth: 1,
            borderColor: "rgba(184,148,58,0.28)",
            marginBottom: 18,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#b8943a",
            }}
          />
          <Text
            style={{
              color: "#b8943a",
              fontSize: 10,
              fontWeight: "600",
              letterSpacing: 0.7,
            }}
          >
            {item.tag}
          </Text>
        </View>

        {/* Headline */}
        <Text
          style={{
            color: "#fff",
            fontSize: 36,
            lineHeight: 42,
            fontWeight: "500",
            marginBottom: 12,
            fontFamily: titleFont,
          }}
        >
          {item.headline}
        </Text>

        {/* Subtext */}
        <Text
          style={{
            color: C.white42,
            fontSize: 13,
            lineHeight: 20,
            marginBottom: 20,
          }}
        >
          {item.sub}
        </Text>

        {/* Visual card */}
        {index === 0 && <Slide1Card />}
        {index === 1 && <Slide2Card />}
        {index === 2 && <Slide3Card />}

        {/* Stat pills */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View
            style={{
              backgroundColor: "rgba(184,148,58,0.16)",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 11,
              borderWidth: 1,
              borderColor: "rgba(184,148,58,0.30)",
            }}
          >
            <Text style={{ color: "#b8943a", fontSize: 17, fontWeight: "700" }}>
              {item.statVal}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.50)",
                fontSize: 11,
                marginTop: 2,
              }}
            >
              {item.statLabel}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 11,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                fontWeight: "700",
                marginBottom: 1,
              }}
            >
              {item.badgeVal}
            </Text>
            <Text
              style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}
            >
              {item.badgeLabel}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// ONBOARDING SCREEN
// ─────────────────────────────────────────────
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  async function handleFinish() {
    // Mark onboarding as completed
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    // Navigate to auth screen
    router.replace("/(auth)");
  }

  function goNext() {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      handleFinish();
    }
  }

  function goToSlide(index: number) {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.navy }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1, paddingTop: Platform.OS === "android" ? 0 : 0 }}>

        {/* ── SLIDES ── */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Slide
              item={item}
              index={index}
              currentIndex={currentIndex}
              onSkip={handleFinish}
            />
          )}
          style={{ flex: 1 }}
        />

        {/* ── BOTTOM BAR ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.06)",
          }}
        >
          {/* Dots */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goToSlide(i)}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    height: 7,
                    borderRadius: 4,
                    width: i === currentIndex ? 24 : 7,
                    backgroundColor:
                      i === currentIndex ? C.gold : "rgba(255,255,255,0.22)",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Next / Get Started button */}
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              backgroundColor: "#b8943a",
              borderRadius: 28,
              paddingHorizontal: 22,
              paddingVertical: 13,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
              {currentIndex < SLIDES.length - 1 ? "Next" : "Get Started"}
            </Text>
            {currentIndex < SLIDES.length - 1 ? (
              <ArrowRight size={16} color="#fff" />
            ) : (
              <ChevronRight size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
