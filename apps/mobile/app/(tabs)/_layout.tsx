/**
 * Valentine Tab Navigation — Custom floating tab bar
 */

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components/ui/icon";

// ── Tab icon config ─────────────────────────────────────────

const TAB_CONFIG: Record<
  string,
  { icon: IconName; iconFocused: IconName; label: string }
> = {
  index: { icon: "home-outline", iconFocused: "home", label: "Home" },
  discover: { icon: "heart-outline", iconFocused: "heart", label: "Discover" },
  missions: {
    icon: "compass-outline",
    iconFocused: "compass",
    label: "Missions",
  },
  social: {
    icon: "chatbubbles-outline",
    iconFocused: "chatbubbles",
    label: "Social",
  },
  profile: {
    icon: "sparkles-outline",
    iconFocused: "sparkles",
    label: "Profile",
  },
};

// ── Floating Analyzer Button ────────────────────────────────

function AnalyzerButton() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.6,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, glow]);

  return (
    <View className="items-center" style={{ marginTop: -28 }}>
      {/* Outer glow ring */}
      <Animated.View
        style={{
          position: "absolute",
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: "#f43f5e",
          opacity: glow,
          transform: [{ scale }],
        }}
      />
      {/* Button */}
      <Pressable
        onPress={() => router.push("/analyze")}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#f43f5e",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#f43f5e",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Icon name="scan" size={26} color="#fff" />
      </Pressable>
      <Text className="text-primary text-[10px] font-semibold mt-1">
        Analyze
      </Text>
    </View>
  );
}

// ── Custom Tab Bar ──────────────────────────────────────────

function ValentineTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes;

  // Insert analyzer button at center index
  const centerIndex = Math.floor(routes.length / 2);

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 6,
        backgroundColor: "#0f0a1a",
        borderTopWidth: 1,
        borderTopColor: "#3d2856",
        ...Platform.select({
          ios: {
            shadowColor: "#f43f5e",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          },
          android: { elevation: 12 },
        }),
      }}
    >
      <View className="flex-row items-end justify-around">
        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? {
            icon: "•",
            label: route.name,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Render the floating analyzer before the center tab
          const elements: React.ReactNode[] = [];
          if (index === centerIndex) {
            elements.push(<AnalyzerButton key="analyzer-btn" />);
          }

          elements.push(
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              className="items-center flex-1 py-1"
            >
              <Icon
                name={isFocused ? config.iconFocused : config.icon}
                size={22}
                color={isFocused ? "#f43f5e" : "rgba(252,231,243,0.45)"}
              />
              <Text
                className={`text-[10px] mt-0.5 font-medium ${
                  isFocused ? "text-primary" : "text-foreground-dim"
                }`}
              >
                {config.label}
              </Text>
              {isFocused && (
                <View
                  className="bg-primary rounded-full mt-1"
                  style={{ width: 4, height: 4 }}
                />
              )}
            </Pressable>,
          );

          return elements;
        })}
      </View>
    </View>
  );
}

// ── Tab Layout ──────────────────────────────────────────────

export default function TabLayout() {
  // Auth redirects are handled by the root layout's AuthGate.
  // No need to check isSignedIn here.

  return (
    <Tabs
      tabBar={(props) => <ValentineTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0f0a1a" },
        headerTintColor: "#fce7f3",
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="discover" options={{ title: "Discover" }} />
      <Tabs.Screen name="missions" options={{ title: "Missions" }} />
      <Tabs.Screen name="social" options={{ title: "Social" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
