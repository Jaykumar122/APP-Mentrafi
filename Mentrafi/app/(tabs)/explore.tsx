import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
import { API_URL } from "../../utils/api";
import BottomNav from "./BottomNav";
import { AuthBackground, C, depthShadow } from "../(auth)/login";

// ---------------------------------------------------------------------------
// Same cosmic dark palette as login, signup, home & profile.
// ---------------------------------------------------------------------------
const GREEN = "#4ade80";
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
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} color={C.pink} fill={i <= rounded ? C.pink : "transparent"} strokeWidth={1.5} />
      ))}
    </View>
  );
}

// Memoized — only re-renders when this specific fund's own props change,
// instead of on every parent re-render (search typing, scroll state, etc.)
const FundCard = memo(function FundCard({ fund }: { fund: Fund }) {
  return (
    <View
      style={{
        backgroundColor: C.input,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
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
            <Text
              style={{
                color: fund.fiveYearReturn != null ? GREEN : C.textFaint,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
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

        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={[C.pink, C.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Invest</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function ExploreScreen() {
  const router = useRouter();
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
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>Explore Funds</Text>
        </View>

        {/* Search — same glass pill as the login/signup input fields */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: C.input,
              borderWidth: 1,
              borderColor: C.inputBorder,
              borderRadius: 16,
              paddingHorizontal: 16,
              height: 50,
            }}
          >
            <Search size={18} color={C.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search funds, categories..."
              placeholderTextColor={C.textFaint}
              style={{ color: "#fff", flex: 1, fontSize: 14, marginLeft: 10 }}
            />
          </View>
        </View>

        {/* Category filters */}
        <View style={{ marginBottom: 16 }}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
            renderItem={({ item }) => {
              const active = item === category;
              return (
                <TouchableOpacity onPress={() => setCategory(item)} activeOpacity={0.85}>
                  {active ? (
                    <LinearGradient
                      colors={[C.pink, C.violet]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
                    >
                      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={{
                        backgroundColor: C.input,
                        borderWidth: 1,
                        borderColor: C.inputBorder,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: "500" }}>{item}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Fund list — flex-1 so this fills the space above the tab bar */}
        <View style={{ flex: 1 }}>
          {loading && funds.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 64 }}>
              <ActivityIndicator color={C.pink} />
            </View>
          ) : error ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 64, paddingHorizontal: 24 }}>
              <Text style={{ color: C.textMuted, fontSize: 13, textAlign: "center" }}>{error}</Text>
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
              renderItem={({ item }) => <FundCard fund={item} />}
              ListFooterComponent={
                loadingMore ? (
                  <View style={{ paddingVertical: 16, alignItems: "center" }}>
                    <ActivityIndicator color={C.pink} size="small" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64 }}>
                  <Text style={{ color: C.textMuted, fontSize: 13 }}>No funds match your search.</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Bottom Navigation — shared component */}
        <BottomNav tabs={tabs} paddingBottom={10} />
      </SafeAreaView>
    </View>
  );
}