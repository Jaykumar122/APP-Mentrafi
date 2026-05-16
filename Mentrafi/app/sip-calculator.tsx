import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, TrendingUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

function DonutChart({
  percentage,
  totalValue,
}: {
  percentage: number;
  totalValue: number;
}) {
  const size = 200;
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
          <SvgGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#9333ea" />
            <Stop offset="100%" stopColor="#ec4899" />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ede9fe"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "#9ca3af", fontSize: 10, letterSpacing: 1 }}>
          TOTAL VALUE
        </Text>
        <Text style={{ color: "#111827", fontSize: 16, fontWeight: "800", marginTop: 4 }}>
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
      <View
        style={{
          height: 5,
          backgroundColor: "#ede9fe",
          borderRadius: 3,
          width: sliderWidth,
        }}
      >
        <LinearGradient
          colors={["#9333ea", "#ec4899"]}
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
          borderColor: "#9333ea",
          elevation: 4,
          shadowColor: "#9333ea",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
        }}
      />
    </View>
  );
}

export default function SIPCalculator() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#9333ea", "#ec4899", "#fb923c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Blob */}
        <View
          style={{
            position: "absolute",
            top: -60,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: "rgba(249,168,212,0.4)",
          }}
        />

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 38,
                height: 38,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft color="#fff" size={18} />
            </TouchableOpacity>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
              SIP Calculator
            </Text>
          </View>
        </View>

        {/* Main Card */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.cardBg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          {/* Donut Chart centered */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <DonutChart percentage={calc.percentage} totalValue={calc.totalValue} />
          </View>

          {/* Legend */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#9333ea" }} />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Invested</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#e5e7eb" }} />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Est. Returns</Text>
            </View>
          </View>

          {/* Result Cards Row */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? colors.inputBg : "#faf5ff",
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: "#ede9fe",
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>
                Invested Amount
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: "800" }}>
                {formatINR(calc.investedAmount)}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#14532d" : "#f0fdf4",
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: "#bbf7d0",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Est. Returns</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                  <TrendingUp size={10} color="#16a34a" />
                  <Text style={{ color: "#16a34a", fontSize: 10, fontWeight: "700" }}>
                    {calc.investedAmount > 0
                      ? ((calc.estimatedReturns / calc.investedAmount) * 100).toFixed(0)
                      : 0}%
                  </Text>
                </View>
              </View>
              <Text style={{ color: "#16a34a", fontSize: 14, fontWeight: "800" }}>
                {formatINR(calc.estimatedReturns)}
              </Text>
            </View>
          </View>

          {/* Total Value */}
          <LinearGradient
            colors={["#9333ea", "#ec4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              padding: 14,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Total Value</Text>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>
              {formatINR(calc.totalValue)}
            </Text>
          </LinearGradient>

          {/* Sliders */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: "500" }}>
                  Monthly Investment
                </Text>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                  {formatINR(monthlyInvestment)}
                </Text>
              </View>
              <SliderInput value={monthlyInvestment} min={500} max={100000} step={500} onChange={setMonthlyInvestment} />
            </View>

            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: "500" }}>
                  Expected Return Rate
                </Text>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                  {expectedReturn}%
                </Text>
              </View>
              <SliderInput value={expectedReturn} min={1} max={30} step={0.5} onChange={setExpectedReturn} />
            </View>

            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: "500" }}>
                  Time Period
                </Text>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                  {timePeriod} Yr
                </Text>
              </View>
              <SliderInput value={timePeriod} min={1} max={30} step={1} onChange={setTimePeriod} />
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity activeOpacity={0.85}>
            <LinearGradient
              colors={["#7c3aed", "#ec4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 18,
                paddingVertical: 16,
                alignItems: "center",
                elevation: 6,
                shadowColor: "#9333ea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "800", fontSize: 14, letterSpacing: 2 }}>
                CALCULATE
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}