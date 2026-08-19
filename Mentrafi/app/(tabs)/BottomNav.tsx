import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { C } from "../(auth)/login";

export default function BottomNav({
  tabs,
  paddingBottom = 10,
}: {
  tabs: { name: string; icon: any; route?: string }[];
  paddingBottom?: number;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";

  function isTabActive(tabRoute?: string) {
    if (!tabRoute) return false;
    // compare by segment - tolerate routes like '/home' and '/(tabs)/home'
    const seg = tabRoute.replace(/^\//, "");
    return pathname.includes(seg);
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 8,
        paddingTop: 10,
        paddingBottom: paddingBottom,
        backgroundColor: "rgba(10,10,20,0.92)",
        borderTopWidth: 1,
        borderTopColor: C.inputBorder,
      }}
    >
      {tabs.map((tab) => {
        const isActive = isTabActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => {
              if (tab.route && !isActive) router.replace(tab.route as any);
            }}
            style={{ alignItems: "center", gap: 4, flex: 1 }}
          >
            <tab.icon size={22} color={isActive ? C.pink : C.textFaint} />
            <Text
              style={{
                fontSize: 10,
                color: isActive ? C.pink : C.textFaint,
                fontWeight: isActive ? "700" : "400",
              }}
            >
              {tab.name}
            </Text>
            {isActive && (
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.pink, marginTop: 1 }} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
