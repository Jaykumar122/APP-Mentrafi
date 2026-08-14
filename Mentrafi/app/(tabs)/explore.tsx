import { useRouter } from "expo-router";
import {
  Home,
  PieChart,
  Search,
  Sparkles,
  Star,
  User,
} from "lucide-react-native";
import { memo, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../utils/api";

// ---------------------------------------------------------------------------
// Brand palette — matches home, ai-advisor & profile screens.
// ---------------------------------------------------------------------------
const NAVY = "#12131c";
const GOLD = "#D4AF37";
const GREEN = "#22c55e";
const PAGE_LIMIT = 20;

type Category = "All" | "Equity" | "Debt" | "Hybrid" | "ELSS" | "Gold";

type Fund = {
  id: string;
  schemeCode?: number;
  name: string;
  category: Category;
  subcategory: string;
  rating: number; // 0–5, supports halves
  oneYearReturn: number | null;
  fiveYearReturn: number | null;
  nav: number | null;
};

const CATEGORIES: Category[] = ["All", "Equity", "Debt", "Hybrid", "ELSS", "Gold"];

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          color={GOLD}
          fill={i <= rounded ? GOLD : "transparent"}
          strokeWidth={1.5}
        />
      ))}
    </View>
  );
}

// Memoized — only re-renders when this specific fund's own props change,
// instead of on every parent re-render (search typing, scroll state, etc.)
const FundCard = memo(function FundCard({
  fund,
  cardBg,
  border,
  textColor,
  textSecondary,
}: {
  fund: Fund;
  cardBg: string;
  border: string;
  textColor: string;
  textSecondary: string;
}) {
  return (
    <View
      style={{ backgroundColor: cardBg, borderColor: border }}
      className="rounded-2xl border p-4 mb-3"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text style={{ color: textColor }} className="font-bold text-base mb-0.5">
            {fund.name}
          </Text>
          <Text style={{ color: textSecondary }} className="text-xs">
            {fund.category} · {fund.subcategory}
          </Text>
        </View>
        <StarRow rating={fund.rating} />
      </View>

      <View className="flex-row items-end justify-between">
        <View className="flex-row gap-5">
          <View>
            <Text style={{ color: textSecondary }} className="text-[11px] mb-1">
              1Y Return
            </Text>
            <Text style={{ color: GREEN }} className="font-semibold text-sm">
              {fund.oneYearReturn != null ? `+${fund.oneYearReturn}%` : "—"}
            </Text>
          </View>
          <View>
            <Text style={{ color: textSecondary }} className="text-[11px] mb-1">
              5Y Return
            </Text>
            <Text
              style={{ color: fund.fiveYearReturn != null ? GREEN : textSecondary }}
              className="font-semibold text-sm"
            >
              {fund.fiveYearReturn != null ? `+${fund.fiveYearReturn}%` : "—"}
            </Text>
          </View>
          <View>
            <Text style={{ color: textSecondary }} className="text-[11px] mb-1">
              NAV
            </Text>
            <Text style={{ color: textColor }} className="font-semibold text-sm">
              {fund.nav != null ? `₹${fund.nav.toFixed(2)}` : "—"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ backgroundColor: NAVY }}
          className="px-4 py-2.5 rounded-full"
        >
          <Text className="text-white font-semibold text-xs">Invest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("Explore");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true); // initial/full-list loading
  const [loadingMore, setLoadingMore] = useState(false); // pagination loading (for UI spinner)
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Tracks the current query/category so a stale in-flight page fetch
  // doesn't overwrite results after the user changed filters.
  const requestId = useRef(0);

  // Synchronous guard against onEndReached firing multiple times before
  // React state (loadingMore) actually updates.
  const loadingMoreRef = useRef(false);

  const tabs = [
    { name: "Home", icon: Home, route: "/home" },
    { name: "Explore", icon: Search, route: "/explore" },
    { name: "Portfolio", icon: PieChart, route: "/portfolio" },
    { name: "AI Advisor", icon: Sparkles, route: "/ai-advisor" },
    { name: "Profile", icon: User, route: "/profile" },
  ];

  // Reset to page 1 whenever search/category changes
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetchFunds(1, controller.signal, /* replace */ true);
    }, 300); // debounce search typing

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, category]);

  async function fetchFunds(pageToLoad: number, signal?: AbortSignal, replace = false) {
    const myRequestId = ++requestId.current;

    try {
      if (replace) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (category !== "All") params.append("category", category);
      if (query.trim()) params.append("q", query.trim());
      params.append("page", String(pageToLoad));
      params.append("limit", String(PAGE_LIMIT));

      const res = await fetch(`${API_URL}/api/funds?${params.toString()}`, { signal });

      if (!res.ok) throw new Error("Failed to fetch funds");

      const data = await res.json();

      // Ignore results from a stale request (user changed filters while this was in-flight)
      if (myRequestId !== requestId.current) return;

      const mapped: Fund[] = data.funds.map((f: any) => ({
        id: String(f.id),
        schemeCode: f.scheme_code,
        name: f.name,
        category: f.category,
        subcategory: f.subcategory,
        rating: Number(f.rating) || 4,
        oneYearReturn: f.oneYearReturn != null ? Number(f.oneYearReturn) : null,
        fiveYearReturn: f.fiveYearReturn != null ? Number(f.fiveYearReturn) : null,
        nav: f.nav != null ? Number(f.nav) : null,
      }));

      setFunds((prev) => {
        if (replace) return mapped;
        const existingIds = new Set(prev.map((f) => f.id));
        const newOnes = mapped.filter((f) => !existingIds.has(f.id));
        return [...prev, ...newOnes];
      });
      setPage(pageToLoad);
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Fund fetch error:", err);
        if (replace) setError("Couldn't load funds. Pull down to retry.");
      }
    } finally {
      if (myRequestId === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  function handleLoadMore() {
    if (loadingMoreRef.current || loading || !hasMore) return;
    loadingMoreRef.current = true;
    fetchFunds(page + 1, undefined, false).finally(() => {
      loadingMoreRef.current = false;
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <Text style={{ color: colors.text }} className="text-3xl font-bold">
          Explore Funds
        </Text>
      </View>

      {/* Search */}
      <View className="px-6 mb-4">
        <View
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
          className="flex-row items-center rounded-2xl border px-4 py-3"
        >
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search funds, categories..."
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text, flex: 1, fontSize: 14, marginLeft: 10 }}
          />
        </View>
      </View>

      {/* Category filters */}
      <View className="mb-4">
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          renderItem={({ item }) => {
            const active = item === category;
            return (
              <TouchableOpacity
                onPress={() => setCategory(item)}
                style={{
                  backgroundColor: active ? NAVY : colors.cardBg,
                  borderColor: active ? NAVY : colors.border,
                }}
                className="px-5 py-2.5 rounded-full border"
              >
                <Text
                  style={{ color: active ? "white" : colors.textSecondary }}
                  className="text-sm font-medium"
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Fund list — flex-1 so this fills the space above the tab bar */}
      <View className="flex-1">
        {loading && funds.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <ActivityIndicator color={GOLD} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-16 px-6">
            <Text style={{ color: colors.textSecondary }} className="text-sm text-center">
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={funds}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            onRefresh={() => fetchFunds(1, undefined, true)}
            refreshing={loading}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={7}
            initialNumToRender={10}
            renderItem={({ item }) => (
              <FundCard
                fund={item}
                cardBg={colors.cardBg}
                border={colors.border}
                textColor={colors.text}
                textSecondary={colors.textSecondary}
              />
            )}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator color={GOLD} size="small" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  No funds match your search.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View
        style={{ backgroundColor: colors.cardBg, borderTopColor: colors.divider }}
        className="flex-row items-center justify-around px-2 pt-2 pb-6 border-t"
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
    </SafeAreaView>
  );
}