import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, TrendingUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Path, Stop } from "react-native-svg";
import { AuthBackground, C, depthShadow, GlowBackdrop } from "../(auth)/login";

const { width } = Dimensions.get("window");
const GREEN = "#4ade80";

// ─────────────────────────────────────────────
// GROWTH ICON — isometric extruded ascending bars, built the same way as
// LockIcon / BadgeIcon / CoinStackIcon: front/top/side faces + sheen
// ─────────────────────────────────────────────
function GrowthIcon() {
  return (
    <Svg width="120" height="120" viewBox="0 0 150 150">
      <Defs>
        <SvgGrad id="barTop1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#c9b3ff" />
          <Stop offset="100%" stopColor={C.violet} />
        </SvgGrad>
        <SvgGrad id="barSide1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#5a34a8" />
          <Stop offset="100%" stopColor="#3c2170" />
        </SvgGrad>
        <SvgGrad id="barTop2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ff9dbc" />
          <Stop offset="100%" stopColor={C.pink} />
        </SvgGrad>
        <SvgGrad id="barSide2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#b23360" />
          <Stop offset="100%" stopColor="#7a1f42" />
        </SvgGrad>
        <SvgGrad id="barTop3" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ffe9a8" />
          <Stop offset="100%" stopColor="#ffcf6e" />
        </SvgGrad>
        <SvgGrad id="barSide3" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#c9932e" />
          <Stop offset="100%" stopColor="#8a5e18" />
        </SvgGrad>
      </Defs>

      {/* bar 1 — shortest, violet */}
      <Path d="M34,108 L34,86 L54,74 L54,96 Z" fill="url(#barTop1)" />
      <Path d="M54,96 L54,74 L64,80 L64,102 Z" fill="url(#barSide1)" />

      {/* bar 2 — mid, pink */}
      <Path d="M60,108 L60,68 L80,56 L80,96 Z" fill="url(#barTop2)" />
      <Path d="M80,96 L80,56 L90,62 L90,102 Z" fill="url(#barSide2)" />

      {/* bar 3 — tallest, gold */}
      <Path d="M86,108 L86,46 L106,34 L106,96 Z" fill="url(#barTop3)" />
      <Path d="M106,96 L106,34 L116,40 L116,102 Z" fill="url(#barSide3)" />

      {/* ground shadow ellipse */}
      <Path d="M28 108 h94 v6 h-94 Z" fill="#000" opacity="0.25" />

      {/* ascending trend line + arrow */}
      <Path
        d="M40 90 L66 72 L92 58 L112 42"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <Path d="M104 42 L112 42 L112 50" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

      {/* highlight sheens */}
      <Path d="M86 48 L104 36 L110 40 L92 52 Z" fill="#fff" opacity="0.3" />
    </Svg>
  );
}

function DonutChart({
  percentage,
  totalValue,
}: {
  percentage: number;
  totalValue: number;
}) {
  const size = 190;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = isNaN(percentage) ? 0 : Math.min(percentage, 100);
  const offset = circumference - (validPercentage / 100) * circumference;

  const formatValue = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <SvgGrad id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={C.pink} />
            <Stop offset="100%" stopColor={C.violet} />
          </SvgGrad>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={C.inputBorder}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: C.textFaint, fontSize: 10, letterSpacing: 1 }}>TOTAL VALUE</Text>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 4 }}>
          {formatValue(totalValue)}
        </Text>
      </View>
    </View>
  );
}

function SliderInput({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}) {
  const sliderWidth = width - 80;
  const percentage = ((value - min) / (max - min)) * 100;
  const thumbPos = (percentage / 100) * sliderWidth;

  const handleTouch = (e: any) => {
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / sliderWidth));
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    onChange(Math.max(min, Math.min(max, stepped)));
  };

  return (
    <View
      style={{ height: 36, justifyContent: "center" }}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
    >
      <View style={{ height: 5, backgroundColor: C.inputBorder, borderRadius: 3, width: sliderWidth }}>
        <LinearGradient
          colors={[C.pink, C.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 5, borderRadius: 3, width: `${percentage}%` }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          left: thumbPos - 11,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "white",
          borderWidth: 3,
          borderColor: C.pink,
          ...depthShadow("sm"),
        }}
      />
    </View>
  );
}

export default function SIPCalculator() {
  const router = useRouter();
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const calc = useMemo(() => {
    const P = monthlyInvestment;
    const r = expectedReturn / 100 / 12;
    const n = timePeriod * 12;
    if (P === 0 || n === 0)
      return { investedAmount: 0, estimatedReturns: 0, totalValue: 0, percentage: 0 };
    const M = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const investedAmount = P * n;
    const estimatedReturns = M - investedAmount;
    const percentage = (investedAmount / M) * 100;
    return { investedAmount, estimatedReturns, totalValue: M, percentage };
  }, [monthlyInvestment, expectedReturn, timePeriod]);

  const formatINR = (val: number) =>
    `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />

      {/* Header — same glass-card gradient as the rest of the app */}
      <LinearGradient
        colors={[C.card, "#050508"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          paddingHorizontal: 24,
          paddingTop: 56,
          paddingBottom: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          borderBottomWidth: 1,
          borderColor: C.cardEdge,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
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
            <ArrowLeft color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>SIP Calculator</Text>
        </View>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}>
        {/* Growth hero icon */}
        <View style={{ height: 130, alignItems: "center", justifyContent: "flex-end", marginBottom: -16 }}>
          <View style={{ position: "absolute", bottom: -24 }}>
            <GlowBackdrop from={C.pink} to={C.violet} />
          </View>
          <View style={{ ...depthShadow("md") }}>
            <GrowthIcon />
          </View>
        </View>

        {/* Donut Chart */}
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <DonutChart percentage={calc.percentage} totalValue={calc.totalValue} />
        </View>

        {/* Legend */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.pink }} />
            <Text style={{ color: C.textMuted, fontSize: 12 }}>Invested</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.inputBorder }} />
            <Text style={{ color: C.textMuted, fontSize: 12 }}>Est. Returns</Text>
          </View>
        </View>

        {/* Result cards row */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: C.input,
              borderWidth: 1,
              borderColor: C.inputBorder,
              borderRadius: 16,
              padding: 12,
            }}
          >
            <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>Invested Amount</Text>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>
              {formatINR(calc.investedAmount)}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(74,222,128,0.1)",
              borderWidth: 1,
              borderColor: "rgba(74,222,128,0.3)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: C.textFaint, fontSize: 11 }}>Est. Returns</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <TrendingUp size={10} color={GREEN} />
                <Text style={{ color: GREEN, fontSize: 10, fontWeight: "700" }}>
                  {calc.investedAmount > 0
                    ? ((calc.estimatedReturns / calc.investedAmount) * 100).toFixed(0)
                    : 0}
                  %
                </Text>
              </View>
            </View>
            <Text style={{ color: GREEN, fontSize: 14, fontWeight: "800" }}>
              {formatINR(calc.estimatedReturns)}
            </Text>
          </View>
        </View>

        {/* Total value — gradient bar */}
        <LinearGradient
          colors={[C.pink, C.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 14,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            ...depthShadow("sm"),
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Total Value</Text>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
            {formatINR(calc.totalValue)}
          </Text>
        </LinearGradient>

        {/* Sliders */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>Monthly Investment</Text>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                {formatINR(monthlyInvestment)}
              </Text>
            </View>
            <SliderInput
              value={monthlyInvestment}
              min={500}
              max={100000}
              step={500}
              onChange={setMonthlyInvestment}
            />
          </View>

          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>Expected Return Rate</Text>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>{expectedReturn}%</Text>
            </View>
            <SliderInput value={expectedReturn} min={1} max={30} step={0.5} onChange={setExpectedReturn} />
          </View>

          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>Time Period</Text>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>{timePeriod} Yr</Text>
            </View>
            <SliderInput value={timePeriod} min={1} max={30} step={1} onChange={setTimePeriod} />
          </View>
        </View>

        {/* Calculate button */}
        <TouchableOpacity activeOpacity={0.88} style={{ ...depthShadow("md") }}>
          <LinearGradient
            colors={[C.pink, C.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 18, paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13, letterSpacing: 2 }}>
              CALCULATE
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}