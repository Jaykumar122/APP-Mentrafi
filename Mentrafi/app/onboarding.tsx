import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Check } from "lucide-react-native";

import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgGrad,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { Fragment, useRef, useState, type ReactElement } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH - 44;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.66, 560);

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────

const C = {
  bgTop: "#1c1547",
  bgMid: "#120c33",
  bgBottom: "#050310",
  card: "#0a0a14",
  cardEdge: "rgba(255,255,255,0.06)",
  pink: "#ff4f81",
  magenta: "#c239b3",
  violet: "#7b3ff2",
  cyan: "#33d9e8",
  textMuted: "rgba(255,255,255,0.45)",
  textFaint: "rgba(255,255,255,0.28)",
};

// ─────────────────────────────────────────────
// SHADOW
// ─────────────────────────────────────────────

const depthShadow = (level: "sm" | "md" | "lg" = "md") => {
  const map = {
    sm: { h: 4, r: 10, op: 0.3, elev: 5 },
    md: { h: 12, r: 24, op: 0.4, elev: 12 },
    lg: { h: 26, r: 44, op: 0.55, elev: 22 },
  }[level];

  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: map.h },
    shadowRadius: map.r,
    shadowOpacity: map.op,
    elevation: map.elev,
  };
};

// ─────────────────────────────────────────────
// CARD TILT
// ─────────────────────────────────────────────

const cardTilt = {
  transform: [
    { perspective: 1100 },
    { rotateX: "3.5deg" as const },
    { rotateY: "-3deg" as const },
  ],
};

// ─────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────

const SLIDES = [
  {
    id: "1",
    tag: "SMART INVESTING",
    headline: "Grow wealth with\nexpert-managed funds.",
    sub: "Access 60+ SEBI-registered mutual funds curated by top fund managers across equity, debt and hybrid categories.",
    statVal: "+26.2%",
    statLabel: "Top 1Y return",
    badgeVal: "₹84,200 Cr",
    badgeLabel: "AUM",
  },
  {
    id: "2",
    tag: "START SMALL",
    headline: "SIP from just\n₹500 a month.",
    sub: "Set up automatic monthly investments and let compounding work silently over time. Cancel or pause whenever you want.",
    statVal: "2.4M+",
    statLabel: "Active investors",
    badgeVal: "₹500/mo",
    badgeLabel: "Min. SIP",
  },
  {
    id: "3",
    tag: "AI-POWERED ADVICE",
    headline: "Ask our AI.\nGet the right fund.",
    sub: "Mentrafi AI analyses your goals, risk appetite, and investment horizon to recommend the perfect fund — instantly.",
    statVal: "98.2%",
    statLabel: "Recommendation accuracy",
    badgeVal: "Mentrafi AI",
    badgeLabel: "Powered by",
  },
];

// ─────────────────────────────────────────────
// GLOW BACKDROP
// ─────────────────────────────────────────────

function GlowBackdrop({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  return (
    <Svg
      width={CARD_WIDTH}
      height={230}
      viewBox="0 0 300 230"
    >
      <Defs>
        <RadialGradient
          id="glowA"
          cx="50%"
          cy="72%"
          r="60%"
        >
          <Stop
            offset="0%"
            stopColor={from}
            stopOpacity="0.9"
          />
          <Stop
            offset="55%"
            stopColor={to}
            stopOpacity="0.35"
          />
          <Stop
            offset="100%"
            stopColor={to}
            stopOpacity="0"
          />
        </RadialGradient>

        <RadialGradient
          id="glowB"
          cx="50%"
          cy="80%"
          r="38%"
        >
          <Stop
            offset="0%"
            stopColor="#fff"
            stopOpacity="0.5"
          />
          <Stop
            offset="100%"
            stopColor="#fff"
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Ellipse
        cx="150"
        cy="165"
        rx="150"
        ry="95"
        fill="url(#glowA)"
      />

      <Ellipse
        cx="150"
        cy="178"
        rx="70"
        ry="34"
        fill="url(#glowB)"
      />

      <Ellipse
        cx="150"
        cy="210"
        rx="46"
        ry="9"
        fill="#000"
        opacity="0.4"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// ICON 1
// ─────────────────────────────────────────────

function GrowthIcon() {
  const dx = 11;
  const dy = 7;
  const base = 122;

  const bars = [
    {
      x: 26,
      w: 20,
      top: 96,
      front: "url(#g1a)",
      side: "url(#g1aSide)",
    },
    {
      x: 54,
      w: 20,
      top: 74,
      front: "url(#g1a)",
      side: "url(#g1aSide)",
    },
    {
      x: 82,
      w: 20,
      top: 50,
      front: "url(#g1b)",
      side: "url(#g1bSide)",
    },
    {
      x: 110,
      w: 20,
      top: 24,
      front: "url(#g1b)",
      side: "url(#g1bSide)",
    },
  ];

  return (
    <Svg
      width="150"
      height="150"
      viewBox="0 0 165 150"
    >
      <Defs>
        <SvgGrad
          id="g1a"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <Stop
            offset="0%"
            stopColor="#ff9dbc"
          />
          <Stop
            offset="100%"
            stopColor={C.pink}
          />
        </SvgGrad>

        <SvgGrad
          id="g1aSide"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <Stop
            offset="0%"
            stopColor="#b23360"
          />
          <Stop
            offset="100%"
            stopColor="#7a1f42"
          />
        </SvgGrad>

        <SvgGrad
          id="g1b"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <Stop
            offset="0%"
            stopColor="#8f6bff"
          />
          <Stop
            offset="100%"
            stopColor={C.violet}
          />
        </SvgGrad>

        <SvgGrad
          id="g1bSide"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <Stop
            offset="0%"
            stopColor="#4c2794"
          />
          <Stop
            offset="100%"
            stopColor="#301566"
          />
        </SvgGrad>

        <SvgGrad
          id="g1top"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <Stop
            offset="0%"
            stopColor="#ffffff"
            stopOpacity="0.95"
          />
          <Stop
            offset="100%"
            stopColor="#ffffff"
            stopOpacity="0.55"
          />
        </SvgGrad>
      </Defs>

      {bars.map((b, i) => (
        <Fragment key={i}>
          <Path
            d={`M${b.x + b.w},${base}
                L${b.x + b.w},${b.top}
                L${b.x + b.w + dx},${b.top - dy}
                L${b.x + b.w + dx},${base - dy} Z`}
            fill={b.side}
          />

          <Path
            d={`M${b.x},${b.top}
                L${b.x + b.w},${b.top}
                L${b.x + b.w + dx},${b.top - dy}
                L${b.x + dx},${b.top - dy} Z`}
            fill="url(#g1top)"
          />

          <Path
            d={`M${b.x},${base}
                L${b.x},${b.top}
                L${b.x + b.w},${b.top}
                L${b.x + b.w},${base} Z`}
            fill={b.front}
          />
        </Fragment>
      ))}

      <Path
        d="M22 96 L48 70 L76 82 L133 18"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />

      <Path
        d="M115 18 L133 18 L133 36"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// ICON 2
// ─────────────────────────────────────────────

function RecurringIcon() {
  return (
    <Svg
      width="150"
      height="150"
      viewBox="0 0 150 150"
    >
      <Defs>
        <RadialGradient
          id="g2tube"
          cx="50%"
          cy="35%"
          r="70%"
        >
          <Stop
            offset="0%"
            stopColor="#ff9dbc"
          />
          <Stop
            offset="45%"
            stopColor={C.magenta}
          />
          <Stop
            offset="100%"
            stopColor="#3d1140"
          />
        </RadialGradient>

        <SvgGrad
          id="g2edge"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <Stop
            offset="0%"
            stopColor={C.violet}
            stopOpacity="0"
          />
          <Stop
            offset="100%"
            stopColor="#1a0a30"
            stopOpacity="0.9"
          />
        </SvgGrad>
      </Defs>

      <Circle
        cx="75"
        cy="80"
        r="44"
        fill="none"
        stroke="#2a1240"
        strokeWidth="16"
        opacity="0.55"
      />

      <Circle
        cx="75"
        cy="75"
        r="44"
        fill="none"
        stroke="url(#g2tube)"
        strokeWidth="18"
      />

      <Path
        d="M35 88 A44 44 0 0 0 115 88"
        stroke="url(#g2edge)"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />

      <Path
        d="M40 55 A44 44 0 0 1 110 55"
        stroke="#fff"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />

      <Path
        d="M97 40 L110 47 L100 58"
        stroke="#fff"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle
        cx="75"
        cy="75"
        r="14"
        fill="#0a0a14"
      />

      <Circle
        cx="75"
        cy="75"
        r="14"
        fill="url(#g2tube)"
        opacity="0.9"
      />

      <Circle
        cx="70"
        cy="70"
        r="4"
        fill="#fff"
        opacity="0.8"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// ICON 3
// ─────────────────────────────────────────────

function AIIcon() {
  return (
    <Svg
      width="150"
      height="150"
      viewBox="0 0 150 150"
    >
      <Defs>
        <RadialGradient
          id="g3sphere"
          cx="38%"
          cy="30%"
          r="75%"
        >
          <Stop
            offset="0%"
            stopColor="#ffe3ee"
          />
          <Stop
            offset="30%"
            stopColor="#ff9dbc"
          />
          <Stop
            offset="65%"
            stopColor={C.pink}
          />
          <Stop
            offset="100%"
            stopColor="#4a1030"
          />
        </RadialGradient>

        <SvgGrad
          id="g3spark"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <Stop
            offset="0%"
            stopColor="#fff"
          />
          <Stop
            offset="45%"
            stopColor="#c9b3ff"
          />
          <Stop
            offset="100%"
            stopColor={C.violet}
          />
        </SvgGrad>

        <RadialGradient
          id="g3sparkShadow"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <Stop
            offset="0%"
            stopColor="#000"
            stopOpacity="0.5"
          />
          <Stop
            offset="100%"
            stopColor="#000"
            stopOpacity="0"
          />
        </RadialGradient>
      </Defs>

      <Ellipse
        cx="75"
        cy="98"
        rx="56"
        ry="12"
        stroke={C.cyan}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />

      <Ellipse
        cx="75"
        cy="98"
        rx="36"
        ry="7"
        stroke={C.cyan}
        strokeWidth="2"
        fill="none"
        opacity="0.8"
      />

      <Ellipse
        cx="75"
        cy="103"
        rx="24"
        ry="7"
        fill="url(#g3sparkShadow)"
      />

      <Circle
        cx="75"
        cy="80"
        r="22"
        fill="url(#g3sphere)"
      />

      <Circle
        cx="67"
        cy="71"
        r="6"
        fill="#fff"
        opacity="0.55"
      />

      <Path
        d="M75 22 L81 46 L104 52 L81 58 L75 82 L69 58 L46 52 L69 46 Z"
        fill="url(#g3spark)"
      />

      <Path
        d="M75 22 L81 46 L75 52 L69 46 Z"
        fill="#fff"
        opacity="0.6"
      />

      <Circle
        cx="75"
        cy="52"
        r="5"
        fill="#fff"
        opacity="0.9"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// SLIDE CARD
// ─────────────────────────────────────────────

function SlideCard({
  item,
  colors,
  Icon,
}: {
  item: (typeof SLIDES)[0];
  colors: [string, string];
Icon: () => ReactElement;
}) {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        ...depthShadow("lg"),
        ...cardTilt,
      }}
    >
      <LinearGradient
        colors={[C.card, "#050508"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          flex: 1,
          borderRadius: 36,
          borderWidth: 1,
          borderColor: C.cardEdge,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -40,
            left: -60,
            width: 140,
            height: CARD_HEIGHT + 120,
            backgroundColor: "rgba(255,255,255,0.05)",
            transform: [{ rotate: "18deg" }],
          }}
        />

        <View
          style={{
            height: 232,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              position: "absolute",
              bottom: 0,
            }}
          >
            <GlowBackdrop
              from={colors[0]}
              to={colors[1]}
            />
          </View>

          <View
            style={{
              marginBottom: 34,
              ...depthShadow("md"),
            }}
          >
            <Icon />
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 26,
            flex: 1,
          }}
        >
          <Text
            style={{
              color: colors[0],
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.2,
              marginBottom: 10,
            }}
          >
            {item.tag}
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 23,
              lineHeight: 29,
              fontWeight: "700",
              marginBottom: 10,
            }}
          >
            {item.headline}
          </Text>

          <Text
            style={{
              color: C.textMuted,
              fontSize: 12.5,
              lineHeight: 19,
            }}
          >
            {item.sub}
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginTop: "auto",
              marginBottom: 22,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.07)",
              gap: 22,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {item.statVal}
              </Text>

              <Text
                style={{
                  color: C.textFaint,
                  fontSize: 9.5,
                  marginTop: 2,
                }}
              >
                {item.statLabel}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {item.badgeVal}
              </Text>

              <Text
                style={{
                  color: C.textFaint,
                  fontSize: 9.5,
                  marginTop: 2,
                }}
              >
                {item.badgeLabel}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ─────────────────────────────────────────────
// FLOATING SPHERE
// ─────────────────────────────────────────────

function FloatingSphere({
  size,
  top,
  left,
  right,
  color,
  opacity = 0.5,
}: {
  size: number;
  top: number;
  left?: number;
  right?: number;
  color: string;
  opacity?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        left,
        right,
        opacity,
      }}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
      >
        <Defs>
          <RadialGradient
            id={`sph-${size}-${top}`}
            cx="35%"
            cy="30%"
            r="75%"
          >
            <Stop
              offset="0%"
              stopColor="#fff"
              stopOpacity="0.9"
            />

            <Stop
              offset="35%"
              stopColor={color}
              stopOpacity="0.85"
            />

            <Stop
              offset="100%"
              stopColor={color}
              stopOpacity="0.05"
            />
          </RadialGradient>
        </Defs>

        <Circle
          cx="50"
          cy="50"
          r="46"
          fill={`url(#sph-${size}-${top})`}
        />
      </Svg>
    </View>
  );
}

const ICON_MAP = [
  GrowthIcon,
  RecurringIcon,
  AIIcon,
];

const GLOW_COLORS: [string, string][] = [
  [C.pink, C.violet],
  [C.magenta, C.violet],
  [C.pink, C.cyan],
];

// ─────────────────────────────────────────────
// ONBOARDING SCREEN
// ─────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  // IMPORTANT:
  // After onboarding, go directly to LOGIN.
  async function handleFinish() {
    try {
      await AsyncStorage.setItem(
        "hasSeenOnboarding",
        "true"
      );

      router.replace("/(auth)/login");
    } catch (error) {
      console.error(
        "Failed to save onboarding status:",
        error
      );

      router.replace("/(auth)/login");
    }
  }

  function goNext() {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;

      flatListRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });

      setCurrentIndex(next);
    } else {
      handleFinish();
    }
  }

  const isLast =
    currentIndex === SLIDES.length - 1;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bgBottom,
      }}
    >
      {/* Background */}
      <LinearGradient
        colors={[
          C.bgTop,
          C.bgMid,
          C.bgBottom,
        ]}
        start={{
          x: 0.15,
          y: 0,
        }}
        end={{
          x: 0.85,
          y: 1,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Corner glow */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -120,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor:
            "rgba(123,63,242,0.18)",
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -140,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor:
            "rgba(51,217,232,0.10)",
        }}
      />

      {/* Floating spheres */}
      <FloatingSphere
        size={70}
        top={90}
        left={18}
        color={C.violet}
        opacity={0.45}
      />

      <FloatingSphere
        size={46}
        top={SCREEN_HEIGHT * 0.62}
        right={26}
        color={C.cyan}
        opacity={0.4}
      />

      <FloatingSphere
        size={30}
        top={140}
        right={40}
        color={C.pink}
        opacity={0.35}
      />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          onPress={handleFinish}
          activeOpacity={0.7}
          style={{
            position: "absolute",
            top:
              Platform.OS === "android"
                ? 46
                : 58,
            right: 24,
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: C.textMuted,
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop:
            Platform.OS === "android"
              ? 20
              : 0,
        }}
      >
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.x /
                SCREEN_WIDTH
            );

            setCurrentIndex(idx);
          }}
          renderItem={({ item, index }) => {
            const Icon = ICON_MAP[index];

            return (
              <View
                style={{
                  width: SCREEN_WIDTH,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SlideCard
                  item={item}
                  colors={GLOW_COLORS[index]}
                  Icon={Icon}
                />
              </View>
            );
          }}
          style={{
            flexGrow: 0,
          }}
        />

        {/* Pagination dots */}
        <View
          style={{
            flexDirection: "row",
            gap: 7,
            marginTop: 22,
          }}
        >
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width:
                  i === currentIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === currentIndex
                    ? "#fff"
                    : "rgba(255,255,255,0.22)",
              }}
            />
          ))}
        </View>
      </View>

      {/* Next / Get Started */}
      <TouchableOpacity
        onPress={goNext}
        activeOpacity={0.88}
        style={{
          position: "absolute",
          bottom: 40,
          right: 28,
          ...depthShadow("lg"),
        }}
      >
        <LinearGradient
          colors={[C.pink, C.violet]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={{
            width: isLast
              ? undefined
              : 58,
            height: 58,
            minWidth: isLast
              ? 168
              : 58,
            borderRadius: 29,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            paddingHorizontal: isLast
              ? 22
              : 0,
            gap: 8,
          }}
        >
          {isLast ? (
            <>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Get Started
              </Text>

              <Check
                size={17}
                color="#fff"
              />
            </>
          ) : (
            <ArrowRight
              size={22}
              color="#fff"
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}