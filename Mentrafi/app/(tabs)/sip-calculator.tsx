import { useRouter } from "expo-router";
import { ArrowLeft, TrendingUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

// ---------------------------------------------------------------------------
// Brand palette — matches home, explore, portfolio, ai-advisor & profile.
// ---------------------------------------------------------------------------
const NAVY = "#12131c";
const NAVY_SOFT = "rgba(255,255,255,0.10)";
const NAVY_BORDER = "rgba(255,255,255,0.18)";
const GOLD = "#D4AF37";
const GOLD_SOFT_LIGHT = "#fdf6e3";
const GREEN = "#22c55e";
const GREEN_SOFT_LIGHT = "#f0fdf4";
const GREEN_SOFT_DARK = "#14532d";
const GREEN_BORDER = "#bbf7d0";

function DonutChart({
  percentage,
  totalValue,
  ringTrackColor,
}: {
  percentage: number;
  totalValue: number;
  ringTrackColor: string;
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
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringTrackColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={GOLD}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "#9ca3af", fontSize: 10, letterSpacing: 1 }}>TOTAL VALUE</Text>
        <Text style={{ color: NAVY, fontSize: 16, fontWeight: "800", marginTop: 4 }}>
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
  trackColor,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  trackColor: string;
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
      <View style={{ height: 5, backgroundColor: trackColor, borderRadius: 3, width: sliderWidth }}>
        <View
          style={{
            height: 5,
            borderRadius: 3,
            width: `${percentage}%`,
            backgroundColor: GOLD,
          }}
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
          borderColor: GOLD,
          elevation: 4,
          shadowColor: GOLD,
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header — navy, matches home/portfolio/sip-dashboard hero */}
      <View style={{ backgroundColor: NAVY }} className="px-6 pt-14 pb-6 rounded-b-[32px]">
        <View className="flex-row items-center gap-3.5">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: NAVY_SOFT }}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <ArrowLeft color="#fff" size={18} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">SIP Calculator</Text>
        </View>
      </View>

      {/* Main Card */}
      <View
        style={{ backgroundColor: colors.cardBg, flex: 1 }}
        className="px-5 pt-6 pb-6"
      >
        {/* Donut Chart */}
        <View className="items-center mb-3">
          <DonutChart
            percentage={calc.percentage}
            totalValue={calc.totalValue}
            ringTrackColor={isDark ? colors.border : GOLD_SOFT_LIGHT}
          />
        </View>

        {/* Legend */}
        <View className="flex-row justify-center gap-5 mb-4">
          <View className="flex-row items-center gap-1.5">
            <View style={{ backgroundColor: GOLD }} className="w-2 h-2 rounded-full" />
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              Invested
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View style={{ backgroundColor: colors.border }} className="w-2 h-2 rounded-full" />
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              Est. Returns
            </Text>
          </View>
        </View>

        {/* Result cards row */}
        <View className="flex-row gap-2.5 mb-4">
          <View
            style={{
              backgroundColor: isDark ? colors.inputBg : "#faf5ea",
              borderColor: isDark ? colors.border : "#f0e3c0",
            }}
            className="flex-1 rounded-2xl p-3 border"
          >
            <Text style={{ color: colors.textSecondary }} className="text-[11px] mb-1">
              Invested Amount
            </Text>
            <Text style={{ color: colors.text }} className="text-sm font-extrabold">
              {formatINR(calc.investedAmount)}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: isDark ? GREEN_SOFT_DARK : GREEN_SOFT_LIGHT,
              borderColor: GREEN_BORDER,
            }}
            className="flex-1 rounded-2xl p-3 border"
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text style={{ color: colors.textSecondary }} className="text-[11px]">
                Est. Returns
              </Text>
              <View className="flex-row items-center gap-0.5">
                <TrendingUp size={10} color={GREEN} />
                <Text style={{ color: GREEN }} className="text-[10px] font-bold">
                  {calc.investedAmount > 0
                    ? ((calc.estimatedReturns / calc.investedAmount) * 100).toFixed(0)
                    : 0}
                  %
                </Text>
              </View>
            </View>
            <Text style={{ color: GREEN }} className="text-sm font-extrabold">
              {formatINR(calc.estimatedReturns)}
            </Text>
          </View>
        </View>

        {/* Total value */}
        <View
          style={{ backgroundColor: NAVY }}
          className="rounded-2xl p-3.5 mb-5 flex-row items-center justify-between"
        >
          <Text className="text-white/70 text-[13px]">Total Value</Text>
          <Text style={{ color: GOLD }} className="text-lg font-extrabold">
            {formatINR(calc.totalValue)}
          </Text>
        </View>

        {/* Sliders */}
        <View className="gap-3 mb-5">
          <View>
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: colors.text }} className="text-[13px] font-medium">
                Monthly Investment
              </Text>
              <Text style={{ color: colors.text }} className="text-[13px] font-bold">
                {formatINR(monthlyInvestment)}
              </Text>
            </View>
            <SliderInput
              value={monthlyInvestment}
              min={500}
              max={100000}
              step={500}
              onChange={setMonthlyInvestment}
              trackColor={isDark ? colors.border : "#f0e3c0"}
            />
          </View>

          <View>
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: colors.text }} className="text-[13px] font-medium">
                Expected Return Rate
              </Text>
              <Text style={{ color: colors.text }} className="text-[13px] font-bold">
                {expectedReturn}%
              </Text>
            </View>
            <SliderInput
              value={expectedReturn}
              min={1}
              max={30}
              step={0.5}
              onChange={setExpectedReturn}
              trackColor={isDark ? colors.border : "#f0e3c0"}
            />
          </View>

          <View>
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: colors.text }} className="text-[13px] font-medium">
                Time Period
              </Text>
              <Text style={{ color: colors.text }} className="text-[13px] font-bold">
                {timePeriod} Yr
              </Text>
            </View>
            <SliderInput
              value={timePeriod}
              min={1}
              max={30}
              step={1}
              onChange={setTimePeriod}
              trackColor={isDark ? colors.border : "#f0e3c0"}
            />
          </View>
        </View>

        {/* Calculate button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            backgroundColor: GOLD,
            elevation: 6,
            shadowColor: GOLD,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
          className="rounded-2xl py-4 items-center"
        >
          <Text style={{ color: NAVY }} className="font-extrabold text-sm tracking-widest">
            CALCULATE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}