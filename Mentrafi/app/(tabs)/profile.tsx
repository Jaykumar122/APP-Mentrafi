import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Award,
  Bell,
  Camera as CameraIcon,
  ChevronRight,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  LogOut,
  Pencil,
  Settings,
  Shield,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import * as ImageManipulator from "expo-image-manipulator";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../utils/api";

// ---------------------------------------------------------------------------
// Brand palette — matches the redesigned home screen (dark-navy + gold hero,
// same treatment regardless of light/dark app theme).
// ---------------------------------------------------------------------------
const NAVY = "#12131c";
const NAVY_SOFT = "rgba(255,255,255,0.10)";
const NAVY_SOFT_2 = "rgba(255,255,255,0.15)";
const NAVY_BORDER = "rgba(255,255,255,0.18)";
const GOLD = "#D4AF37";
const GOLD_SOFT = "rgba(212,175,55,0.16)";
const GREEN_SOFT_LIGHT = "#dcfce7";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CROP_SIZE = SCREEN_WIDTH - 80; // large, full-screen-style viewfinder

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  badge?: string;
};

type ProfileData = {
  name: string;
  email: string;
  avatarUrl: string | null;
  kycStatus: string;
  tier: string;
  personalInfo: {
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    location: string | null;
  };
  stats: {
    portfolioValue: number;
    portfolioReturnPercent: number;
    activeSips: number;
    monthlySipAmount: number;
    fundsHeld: number;
  };
};

type PersonalInfoForm = {
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
};

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
  isDark: boolean;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.2,
          marginBottom: 10,
          marginTop: 16,
        }}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function MenuRow({
  item,
  last,
  colors,
  onPress,
}: {
  item: MenuItem;
  last: boolean;
  colors: any;
  onPress?: () => void;
}) {
  const Icon = item.icon;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: GOLD_SOFT,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Icon size={18} color={GOLD} />
      </View>
      <Text
        style={{
          flex: 1,
          color: colors.text,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {item.label}
      </Text>
      {item.badge && (
        <View
          style={{
            backgroundColor: GREEN_SOFT_LIGHT,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#16a34a", fontSize: 11, fontWeight: "700" }}>
            {item.badge}
          </Text>
        </View>
      )}
      <ChevronRight size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showPersonalInfoEditor, setShowPersonalInfoEditor] = useState(false);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [personalInfoForm, setPersonalInfoForm] = useState<PersonalInfoForm>({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    location: "",
  });

  const [pendingAvatarSize, setPendingAvatarSize] = useState({ width: 0, height: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/onboarding" as any);
        return;
      }

      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data);
      setPersonalInfoForm({
        name: data.name ?? "",
        phone: data.personalInfo?.phone ?? "",
        dateOfBirth: data.personalInfo?.dateOfBirth ?? "",
        gender: data.personalInfo?.gender ?? "",
        location: data.personalInfo?.location ?? "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  function openPersonalInfoEditor() {
    setPersonalInfoForm({
      name: profile?.name ?? "",
      phone: profile?.personalInfo?.phone ?? "",
      dateOfBirth: profile?.personalInfo?.dateOfBirth ?? "",
      gender: profile?.personalInfo?.gender ?? "",
      location: profile?.personalInfo?.location ?? "",
    });
    setShowPersonalInfoEditor(true);
  }

  async function savePersonalInfo() {
    try {
      setSavingPersonalInfo(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/onboarding" as any);
        return;
      }

      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: personalInfoForm.name.trim(),
          phone: personalInfoForm.phone.trim() || null,
          dateOfBirth: personalInfoForm.dateOfBirth.trim() || null,
          gender: personalInfoForm.gender.trim() || null,
          location: personalInfoForm.location.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update personal information");

      const data = await res.json();
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: data.name ?? prev.name,
              personalInfo: {
                phone: data.phone ?? prev.personalInfo?.phone ?? null,
                dateOfBirth: data.date_of_birth
                  ? new Date(data.date_of_birth).toISOString().slice(0, 10)
                  : prev.personalInfo?.dateOfBirth ?? null,
                gender: data.gender ?? prev.personalInfo?.gender ?? null,
                location: data.location ?? prev.personalInfo?.location ?? null,
              },
            }
          : prev
      );
      await AsyncStorage.setItem("userName", data.name ?? personalInfoForm.name);
      setShowPersonalInfoEditor(false);
    } catch (err) {
      console.error("Personal info update error:", err);
      Alert.alert("Update failed", "Couldn't save your personal information. Try again.");
    } finally {
      setSavingPersonalInfo(false);
    }
  }

  function resetCropTransform() {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 4));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Entry point — tapping the pencil icon opens a small choice sheet
  // (Take Photo / Choose from Library) instead of jumping straight to
  // the library picker.
  function handleAvatarPencilPress() {
    setShowAvatarOptions(true);
  }

  // Option 1: photo library — no native crop UI (unreliable across image
  // sizes on some emulators). Opens our own full-screen zoom/pan preview.
  async function handlePickFromLibrary() {
    setShowAvatarOptions(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to change your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    resetCropTransform();
    setPendingAvatar(result.assets[0].uri);
    setPendingAvatarSize({ width: result.assets[0].width, height: result.assets[0].height });
  }

  // Option 2: camera — always opens front-facing (selfie) camera, since
  // this is specifically for a profile picture.
  async function handleTakePhoto() {
    setShowAvatarOptions(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow camera access to take a profile picture.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    resetCropTransform();
    setPendingAvatar(result.assets[0].uri);
    setPendingAvatarSize({ width: result.assets[0].width, height: result.assets[0].height });
  }

  // Step 2: user pinches/pans to frame the photo on the full-screen crop
  // screen, then taps Save — captures exactly what's visible in the
  // circular viewfinder and uploads that.
  async function confirmAvatarUpload() {
    if (!pendingAvatar) return;
    try {
      setUploadingAvatar(true);

      const imgW = pendingAvatarSize.width;
      const imgH = pendingAvatarSize.height;

      // The image is displayed "cover" inside a CROP_SIZE x CROP_SIZE box.
      // Figure out the base (unzoomed) display scale, then apply the user's
      // pinch scale and pan offset to compute which region of the ORIGINAL
      // image is currently visible inside that circular frame.
      const baseScale = Math.max(CROP_SIZE / imgW, CROP_SIZE / imgH);
      const totalScale = baseScale * scale.value;

      const displayedW = imgW * totalScale;
      const displayedH = imgH * totalScale;

      // Center of the crop box in "displayed image" coordinates
      const centerX = displayedW / 2 - translateX.value;
      const centerY = displayedH / 2 - translateY.value;

      // Convert back to original image pixel coordinates
      const cropSizeInOriginal = CROP_SIZE / totalScale;
      let originX = centerX / totalScale - cropSizeInOriginal / 2;
      let originY = centerY / totalScale - cropSizeInOriginal / 2;

      // Clamp so the crop box never goes outside the original image
      originX = Math.max(0, Math.min(originX, imgW - cropSizeInOriginal));
      originY = Math.max(0, Math.min(originY, imgH - cropSizeInOriginal));

      const manipulated = await ImageManipulator.manipulateAsync(
        pendingAvatar,
        [
          {
            crop: {
              originX,
              originY,
              width: cropSizeInOriginal,
              height: cropSizeInOriginal,
            },
          },
          { resize: { width: 500, height: 500 } },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("avatar", {
        uri: manipulated.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const res = await fetch(`${API_URL}/api/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setProfile((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
      setPendingAvatar(null);
    } catch (err) {
      console.error("Avatar upload error:", err);
      Alert.alert("Upload failed", "Couldn't update your profile picture. Try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  const accountItems: MenuItem[] = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "bank", label: "Bank & Payment Methods", icon: Wallet },
    {
      id: "kyc",
      label: "KYC Documents",
      icon: FileText,
      badge: profile?.kycStatus === "verified" ? "Verified" : undefined,
    },
  ];

  const preferenceItems: MenuItem[] = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Privacy", icon: Shield },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userName");
          await AsyncStorage.removeItem("hasSeenOnboarding");
          router.replace("/onboarding" as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator color={GOLD} size="large" />
      </SafeAreaView>
    );
  }

  const avatarSource = profile?.avatarUrl
    ? profile.avatarUrl.startsWith("http")
      ? profile.avatarUrl
      : `${API_URL}${profile.avatarUrl}`
    : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces";

  const stats = [
    {
      label: "Portfolio",
      value: `₹${((profile?.stats.portfolioValue ?? 0) / 100000).toFixed(2)}L`,
      sub: `${profile?.stats.portfolioReturnPercent && profile.stats.portfolioReturnPercent >= 0 ? "+" : ""}${profile?.stats.portfolioReturnPercent ?? 0}%`,
      isGreen: (profile?.stats.portfolioReturnPercent ?? 0) >= 0,
    },
    {
      label: "Active SIPs",
      value: String(profile?.stats.activeSips ?? 0),
      sub: `₹${(profile?.stats.monthlySipAmount ?? 0).toLocaleString("en-IN")}/mo`,
      isGreen: false,
    },
    {
      label: "Funds",
      value: String(profile?.stats.fundsHeld ?? 0),
      sub: "Holdings",
      isGreen: false,
    },
  ];

  // Full-screen crop editor — shown whenever a photo has been picked and is
  // awaiting confirmation. Renders on top of everything, including tab bar.
  if (pendingAvatar) {
    return (
      <View style={{ flex: 1, backgroundColor: NAVY }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setPendingAvatar(null)}
              disabled={uploadingAvatar}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <X size={20} color="white" />
              <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
              Move and Scale
            </Text>

            <TouchableOpacity
              onPress={confirmAvatarUpload}
              disabled={uploadingAvatar}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {uploadingAvatar ? (
                <ActivityIndicator color={GOLD} size="small" />
              ) : (
                <Text style={{ color: GOLD, fontSize: 15, fontWeight: "700" }}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Crop viewfinder — fills most of the screen */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                borderRadius: CROP_SIZE / 2,
                overflow: "hidden",
                backgroundColor: "#000",
                borderWidth: 2,
                borderColor: GOLD,
              }}
            >
              <GestureDetector gesture={composedGesture}>
                <Animated.Image
                  source={{ uri: pendingAvatar }}
                  style={[{ width: CROP_SIZE, height: CROP_SIZE }, animatedImageStyle]}
                  resizeMode="cover"
                />
              </GestureDetector>
            </View>

            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                marginTop: 24,
                textAlign: "center",
                paddingHorizontal: 40,
              }}
            >
              Pinch to zoom, drag to reposition
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header — dark navy + gold, matching the home screen hero */}
        <View style={{ backgroundColor: NAVY, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          {/* Header row */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 52,
              paddingBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                backgroundColor: NAVY_SOFT,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: NAVY_BORDER,
              }}
            >
              <ArrowLeft size={18} color="white" />
            </TouchableOpacity>

            <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
              Profile
            </Text>

            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                backgroundColor: NAVY_SOFT,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: NAVY_BORDER,
              }}
            >
              <Settings size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View style={{ alignItems: "center", paddingBottom: 28 }}>
            <View style={{ position: "relative", marginBottom: 12 }}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderWidth: 3,
                  borderColor: GOLD,
                  overflow: "hidden",
                  backgroundColor: NAVY_SOFT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator color={GOLD} />
                ) : (
                  <Image
                    source={{ uri: avatarSource }}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
              </View>
              <TouchableOpacity
                onPress={handleAvatarPencilPress}
                disabled={uploadingAvatar}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: GOLD,
                  borderWidth: 2,
                  borderColor: NAVY,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil size={12} color={NAVY} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: "800",
                marginBottom: 4,
              }}
            >
              {profile?.name ?? "—"}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              {profile?.email ?? ""}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: GOLD_SOFT,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.35)",
              }}
            >
              <Award size={13} color={GOLD} />
              <Text style={{ color: GOLD, fontSize: 12, fontWeight: "700" }}>
                {profile?.tier ?? "Standard Investor"}
              </Text>
            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 20,
                paddingHorizontal: 20,
                width: "100%",
              }}
            >
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: NAVY_SOFT_2,
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: NAVY_BORDER,
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 10,
                      marginBottom: 4,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "800",
                      marginBottom: 4,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {stat.isGreen && <TrendingUp size={10} color="#86efac" />}
                    <Text
                      style={{
                        color: stat.isGreen ? "#86efac" : "rgba(255,255,255,0.6)",
                        fontSize: 10,
                        fontWeight: "600",
                      }}
                    >
                      {stat.sub}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Body */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.bg,
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
        >
          <Section title="Personal Information" colors={colors} isDark={isDark}>
            <View style={{ padding: 16, gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
                    {profile?.name ?? "—"}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {profile?.email ?? ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={openPersonalInfoEditor}
                  style={{
                    backgroundColor: GOLD_SOFT,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "rgba(212,175,55,0.25)",
                  }}
                >
                  <Text style={{ color: GOLD, fontSize: 12, fontWeight: "700" }}>Edit</Text>
                </TouchableOpacity>
              </View>

              {[
                { label: "Phone", value: profile?.personalInfo?.phone ?? "Not added yet" },
                { label: "Date of Birth", value: profile?.personalInfo?.dateOfBirth ?? "Not added yet" },
                { label: "Gender", value: profile?.personalInfo?.gender ?? "Not added yet" },
                { label: "Location", value: profile?.personalInfo?.location ?? "Not added yet" },
              ].map((field, idx) => (
                <View
                  key={field.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: idx === 0 ? 0 : 12,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: colors.divider,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{field.label}</Text>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>{field.value}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Account" colors={colors} isDark={isDark}>
            {accountItems.map((item, idx) => (
              <MenuRow
                key={item.id}
                item={item}
                last={idx === accountItems.length - 1}
                colors={colors}
                onPress={item.id === "personal" ? openPersonalInfoEditor : undefined}
              />
            ))}
          </Section>

          <Section title="Preferences" colors={colors} isDark={isDark}>
            {preferenceItems.map((item, idx) => (
              <MenuRow
                key={item.id}
                item={item}
                last={idx === preferenceItems.length - 1}
                colors={colors}
              />
            ))}
          </Section>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={{
              marginTop: 24,
              backgroundColor: NAVY,
              borderRadius: 20,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <LogOut size={18} color={GOLD} />
            <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
              Log Out
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 20,
            }}
          >
            MentraFi v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Avatar source picker — Take Photo (front camera) / Choose from Library */}
      {showAvatarOptions && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
            zIndex: 100,
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => setShowAvatarOptions(false)}
          />
          <SafeAreaView edges={["bottom"]}>
            <View
              style={{
                backgroundColor: colors.cardBg,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                  alignSelf: "center",
                  marginBottom: 12,
                }}
              />
              <Text
                style={{
                  textAlign: "center",
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                UPDATE PROFILE PHOTO
              </Text>

              <TouchableOpacity
                onPress={handleTakePhoto}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: GOLD_SOFT,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <CameraIcon size={17} color={GOLD} />
                </View>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500" }}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePickFromLibrary}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: GOLD_SOFT,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <ImageIcon size={17} color={GOLD} />
                </View>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500" }}>
                  Choose from Library
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowAvatarOptions(false)}
                activeOpacity={0.7}
                style={{
                  marginTop: 8,
                  paddingVertical: 14,
                  alignItems: "center",
                  backgroundColor: colors.bg,
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}

      <Modal
        visible={showPersonalInfoEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPersonalInfoEditor(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => setShowPersonalInfoEditor(false)}
          />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View
              style={{
                backgroundColor: colors.cardBg,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingHorizontal: 18,
                paddingTop: 10,
                paddingBottom: 24,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: colors.border,
                  alignSelf: "center",
                  marginBottom: 14,
                }}
              />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
                  Personal Information
                </Text>
                <TouchableOpacity onPress={() => setShowPersonalInfoEditor(false)}>
                  <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: "600" }}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 16, gap: 12 }}>
                {[
                  { label: "Full Name", key: "name", placeholder: "Enter your name" },
                  { label: "Phone Number", key: "phone", placeholder: "Enter mobile number" },
                  { label: "Date of Birth", key: "dateOfBirth", placeholder: "YYYY-MM-DD" },
                  { label: "Gender", key: "gender", placeholder: "Male / Female / Other" },
                  { label: "Location", key: "location", placeholder: "City or locality" },
                ].map((field) => (
                  <View key={field.key} style={{ gap: 6 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "700" }}>
                      {field.label}
                    </Text>
                    <TextInput
                      value={personalInfoForm[field.key as keyof PersonalInfoForm]}
                      onChangeText={(text) =>
                        setPersonalInfoForm((prev) => ({ ...prev, [field.key]: text }))
                      }
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textSecondary}
                      style={{
                        backgroundColor: colors.bg,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                        color: colors.text,
                        paddingHorizontal: 14,
                        paddingVertical: 13,
                        fontSize: 14,
                      }}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={savePersonalInfo}
                disabled={savingPersonalInfo}
                style={{
                  marginTop: 18,
                  backgroundColor: NAVY,
                  borderRadius: 18,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                {savingPersonalInfo ? (
                  <ActivityIndicator color={GOLD} />
                ) : (
                  <Text style={{ color: "white", fontSize: 15, fontWeight: "800" }}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}