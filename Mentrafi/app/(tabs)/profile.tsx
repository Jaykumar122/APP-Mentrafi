import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
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
import Svg, { Defs, Ellipse, LinearGradient as SvgGrad, Path, RadialGradient, Stop } from "react-native-svg";
import { API_URL } from "../../utils/api";
import { AuthBackground, C, depthShadow } from "../(auth)/login";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CROP_SIZE = SCREEN_WIDTH - 80; // large, full-screen-style viewfinder
const GREEN = "#4ade80";

// ─────────────────────────────────────────────
// MINI CUBE — small isometric accent used as a corner watermark on the
// stat cards, in a per-card accent color
// ─────────────────────────────────────────────
function MiniCube({ colorA, colorB }: { colorA: string; colorB: string }) {
  return (
    <Svg width="34" height="34" viewBox="0 0 60 60">
      <Defs>
        <SvgGrad id={`cubeTop-${colorA}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <Stop offset="100%" stopColor={colorA} stopOpacity="0.5" />
        </SvgGrad>
        <SvgGrad id={`cubeSide-${colorA}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colorA} stopOpacity="0.55" />
          <Stop offset="100%" stopColor={colorB} stopOpacity="0.35" />
        </SvgGrad>
      </Defs>
      <Path d="M30,10 L50,20 L50,42 L30,52 L10,42 L10,20 Z" fill={`url(#cubeSide-${colorA})`} />
      <Path d="M30,10 L50,20 L30,30 L10,20 Z" fill={`url(#cubeTop-${colorA})`} />
    </Svg>
  );
}

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

// ─────────────────────────────────────────────
// SECTION — same glass panel material used across the redesigned app
// ─────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          color: C.textFaint,
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
          backgroundColor: C.input,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: C.inputBorder,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function MenuRow({ item, last, onPress }: { item: MenuItem; last: boolean; onPress?: () => void }) {
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
        borderBottomColor: C.inputBorder,
      }}
    >
      <LinearGradient
        colors={[C.pink, C.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Icon size={18} color="#fff" />
      </LinearGradient>
      <Text style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: "500" }}>{item.label}</Text>
      {item.badge && (
        <View
          style={{
            backgroundColor: "rgba(74,222,128,0.15)",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
            marginRight: 8,
          }}
        >
          <Text style={{ color: GREEN, fontSize: 11, fontWeight: "700" }}>{item.badge}</Text>
        </View>
      )}
      <ChevronRight size={16} color={C.textFaint} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
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
      <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
        <AuthBackground />
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={C.pink} size="large" />
        </SafeAreaView>
      </View>
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
      accent: C.pink,
    },
    {
      label: "Active SIPs",
      value: String(profile?.stats.activeSips ?? 0),
      sub: `₹${(profile?.stats.monthlySipAmount ?? 0).toLocaleString("en-IN")}/mo`,
      isGreen: false,
      accent: C.violet,
    },
    {
      label: "Funds",
      value: String(profile?.stats.fundsHeld ?? 0),
      sub: "Holdings",
      isGreen: false,
      accent: C.cyan,
    },
  ];

  // Full-screen crop editor — shown whenever a photo has been picked and is
  // awaiting confirmation. Renders on top of everything, including tab bar.
  if (pendingAvatar) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
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
                <ActivityIndicator color={C.pink} size="small" />
              ) : (
                <Text style={{ color: C.pink, fontSize: 15, fontWeight: "700" }}>
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
                borderColor: C.pink,
                ...depthShadow("md"),
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
                color: C.textMuted,
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
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header — same tilted glass-card material as the login/signup
              cards and the home screen hero */}
          <LinearGradient
            colors={[C.card, "#050508"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              borderBottomWidth: 1,
              borderColor: C.cardEdge,
              overflow: "hidden",
            }}
          >
            {/* Header row */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 52,
                paddingBottom: 24,
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
                  backgroundColor: C.input,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: C.inputBorder,
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
                  backgroundColor: C.input,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: C.inputBorder,
                }}
              >
                <Settings size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar — floating 3D medallion: a grounding shadow,
                an offset "edge" layer for coin-like thickness, a tilted
                gradient ring, then the photo on top */}
            <View style={{ alignItems: "center", paddingBottom: 28 }}>
              <View style={{ width: 112, height: 118, alignItems: "center", marginBottom: 12 }}>
                {/* grounding shadow, same ellipse-under-object trick used
                    under the trophy and the coin stack */}
                <Svg width="112" height="34" style={{ position: "absolute", bottom: -6 }}>
                  <Defs>
                    <RadialGradient id="avatarShadow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#000" stopOpacity="0.55" />
                      <Stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Ellipse cx="56" cy="17" rx="40" ry="10" fill="url(#avatarShadow)" />
                </Svg>

                <View
                  style={{
                    transform: [
                      { perspective: 900 },
                      { rotateX: "8deg" },
                      { rotateY: "-6deg" },
                    ],
                  }}
                >
                  {/* edge layer — offset duplicate behind the ring gives it
                      physical thickness, like a coin viewed at an angle */}
                  <LinearGradient
                    colors={["#5a1f42", "#2c1050"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: "absolute",
                      top: 5,
                      left: 4,
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                    }}
                  />

                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      ...depthShadow("md"),
                    }}
                  >
                    <View
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 44,
                        overflow: "hidden",
                        backgroundColor: C.input,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {uploadingAvatar ? (
                        <ActivityIndicator color={C.pink} />
                      ) : (
                        <Image
                          source={{ uri: avatarSource }}
                          style={{ width: "100%", height: "100%" }}
                        />
                      )}
                    </View>
                  </LinearGradient>
                </View>

                <TouchableOpacity
                  onPress={handleAvatarPencilPress}
                  disabled={uploadingAvatar}
                  style={{
                    position: "absolute",
                    bottom: 14,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: C.pink,
                    borderWidth: 2,
                    borderColor: C.bgBottom,
                    alignItems: "center",
                    justifyContent: "center",
                    ...depthShadow("sm"),
                  }}
                >
                  <Pencil size={12} color="#fff" />

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
                  color: C.textMuted,
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
                  backgroundColor: "rgba(255,79,129,0.14)",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,79,129,0.35)",
                }}
              >
                <Award size={13} color={C.pink} />
                <Text style={{ color: C.pink, fontSize: 12, fontWeight: "700" }}>
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
                      backgroundColor: C.input,
                      borderRadius: 16,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: C.inputBorder,
                      overflow: "hidden",
                    }}
                  >
                    <View style={{ position: "absolute", top: -6, right: -6, opacity: 0.9 }}>
                      <MiniCube colorA={stat.accent} colorB={C.bgBottom} />
                    </View>
                    <Text
                      style={{
                        color: C.textMuted,
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
                      {stat.isGreen && <TrendingUp size={10} color={GREEN} />}
                      <Text
                        style={{
                          color: stat.isGreen ? GREEN : C.textMuted,
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
          </LinearGradient>

          {/* Body */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingBottom: 40,
            }}
          >
            <Section title="Personal Information">
              <View style={{ padding: 16, gap: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                      {profile?.name ?? "—"}
                    </Text>
                    <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                      {profile?.email ?? ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={openPersonalInfoEditor}
                    style={{
                      backgroundColor: "rgba(255,79,129,0.14)",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "rgba(255,79,129,0.3)",
                    }}
                  >
                    <Text style={{ color: C.pink, fontSize: 12, fontWeight: "700" }}>Edit</Text>
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
                      borderTopColor: C.inputBorder,
                    }}
                  >
                    <Text style={{ color: C.textMuted, fontSize: 13 }}>{field.label}</Text>
                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{field.value}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="Account">
              {accountItems.map((item, idx) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  last={idx === accountItems.length - 1}
                  onPress={item.id === "personal" ? openPersonalInfoEditor : undefined}
                />
              ))}
            </Section>

            <Section title="Preferences">
              {preferenceItems.map((item, idx) => (
                <MenuRow key={item.id} item={item} last={idx === preferenceItems.length - 1} />
              ))}
            </Section>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.85}
              style={{
                marginTop: 24,
                backgroundColor: C.input,
                borderWidth: 1,
                borderColor: "rgba(255,79,129,0.3)",
                borderRadius: 20,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                ...depthShadow("sm"),
              }}
            >
              <LogOut size={18} color={C.pink} />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
                Log Out
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                textAlign: "center",
                color: C.textFaint,
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
              backgroundColor: "rgba(0,0,0,0.6)",
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
                  backgroundColor: C.card,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  borderWidth: 1,
                  borderColor: C.cardEdge,
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
                    backgroundColor: C.inputBorder,
                    alignSelf: "center",
                    marginBottom: 12,
                  }}
                />
                <Text
                  style={{
                    textAlign: "center",
                    color: C.textFaint,
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
                    borderBottomColor: C.inputBorder,
                  }}
                >
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <CameraIcon size={17} color="#fff" />
                  </LinearGradient>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "500" }}>
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
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <ImageIcon size={17} color="#fff" />
                  </LinearGradient>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "500" }}>
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
                    backgroundColor: C.input,
                    borderRadius: 14,
                  }}
                >
                  <Text style={{ color: C.textMuted, fontSize: 15, fontWeight: "600" }}>
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
              backgroundColor: "rgba(0,0,0,0.6)",
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
                  backgroundColor: C.card,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  borderWidth: 1,
                  borderColor: C.cardEdge,
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
                    backgroundColor: C.inputBorder,
                    alignSelf: "center",
                    marginBottom: 14,
                  }}
                />
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
                    Personal Information
                  </Text>
                  <TouchableOpacity onPress={() => setShowPersonalInfoEditor(false)}>
                    <Text style={{ color: C.textMuted, fontSize: 14, fontWeight: "600" }}>Close</Text>
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
                      <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: "700" }}>
                        {field.label}
                      </Text>
                      <TextInput
                        value={personalInfoForm[field.key as keyof PersonalInfoForm]}
                        onChangeText={(text) =>
                          setPersonalInfoForm((prev) => ({ ...prev, [field.key]: text }))
                        }
                        placeholder={field.placeholder}
                        placeholderTextColor={C.textFaint}
                        style={{
                          backgroundColor: C.input,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: C.inputBorder,
                          color: "#fff",
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
                  style={{ marginTop: 18, ...depthShadow("sm") }}
                >
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 18,
                      paddingVertical: 14,
                      alignItems: "center",
                    }}
                  >
                    {savingPersonalInfo ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: "white", fontSize: 15, fontWeight: "800" }}>
                        Save Changes
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
