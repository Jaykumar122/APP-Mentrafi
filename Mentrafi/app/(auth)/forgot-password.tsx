import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = () => {
    const newErrors: { [key: string]: string } = {};

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone number is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10,}$/;

      if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
        newErrors.emailOrPhone = "Please enter a valid email or phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors: { [key: string]: string } = {};

    if (!otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to send OTP
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(`OTP sent to ${emailOrPhone}`);
        setStep("otp");
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setErrors({ submit: "Failed to send OTP. Please try again." });
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to verify OTP
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage("OTP verified successfully");
        setStep("password");
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setErrors({ submit: "Invalid OTP. Please try again." });
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to reset password
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage("Password reset successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setErrors({ submit: "Failed to reset password. Please try again." });
    }
  };

  const handleBack = () => {
    if (step === "email") {
      router.back();
    } else if (step === "otp") {
      setStep("email");
      setOtp("");
      setErrors({});
      setSuccessMessage("");
    } else {
      setStep("otp");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setSuccessMessage("");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-1 justify-center px-6 py-10">
          {/* Back Button */}
          <TouchableOpacity onPress={handleBack} className="mb-6">
            <Text className="text-blue-600 font-semibold text-base">
              ← Back
            </Text>
          </TouchableOpacity>

          {/* Title */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-blue-600 mb-2">
              Reset Password
            </Text>
            <Text className="text-sm text-gray-500">
              {step === "email" && "Enter your email or phone number"}
              {step === "otp" && "Enter the OTP sent to your account"}
              {step === "password" && "Create a new password"}
            </Text>
          </View>

          {/* Error Message */}
          {errors.submit && (
            <View className="bg-red-100 border border-red-400 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm">{errors.submit}</Text>
            </View>
          )}

          {/* Success Message */}
          {successMessage && (
            <View className="bg-green-100 border border-green-400 rounded-lg p-3 mb-4">
              <Text className="text-green-700 text-sm">{successMessage}</Text>
            </View>
          )}

          {/* STEP 1: Email/Phone */}
          {step === "email" && (
            <>
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">
                  Email or Phone Number
                </Text>
                <TextInput
                  className={`border-2 rounded-lg px-4 py-3 text-base font-medium ${
                    errors.emailOrPhone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  placeholder="Enter email or phone number"
                  placeholderTextColor="#9CA3AF"
                  value={emailOrPhone}
                  onChangeText={(text) => {
                    setEmailOrPhone(text);
                    if (errors.emailOrPhone) {
                      setErrors({ ...errors, emailOrPhone: "" });
                    }
                  }}
                  editable={!isLoading}
                />
                {errors.emailOrPhone && (
                  <Text className="text-red-600 text-sm mt-2">
                    {errors.emailOrPhone}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={isLoading}
                className={`py-4 rounded-lg items-center justify-center ${
                  isLoading ? "bg-blue-400" : "bg-blue-600"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <>
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">
                  Enter OTP
                </Text>
                <TextInput
                  className={`border-2 rounded-lg px-4 py-3 text-base font-medium text-center tracking-widest ${
                    errors.otp
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, "").slice(0, 6));
                    if (errors.otp) {
                      setErrors({ ...errors, otp: "" });
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!isLoading}
                />
                {errors.otp && (
                  <Text className="text-red-600 text-sm mt-2">
                    {errors.otp}
                  </Text>
                )}
              </View>

              <Text className="text-gray-600 text-sm text-center mb-6">
                Didn't receive OTP?{" "}
                <Text className="text-blue-600 font-semibold">Resend</Text>
              </Text>

              <TouchableOpacity
                onPress={handleVerifyOTP}
                disabled={isLoading}
                className={`py-4 rounded-lg items-center justify-center ${
                  isLoading ? "bg-blue-400" : "bg-blue-600"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Verify OTP
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* STEP 3: New Password */}
          {step === "password" && (
            <>
              {/* New Password */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">
                  New Password
                </Text>
                <View
                  className={`flex-row items-center border-2 rounded-lg px-4 py-3 ${
                    errors.newPassword
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <TextInput
                    className="flex-1 text-base font-medium"
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: "" });
                      }
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Text className="text-blue-600 font-semibold text-sm">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <Text className="text-red-600 text-sm mt-2">
                    {errors.newPassword}
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View className="mb-8">
                <Text className="text-gray-700 font-semibold mb-2">
                  Confirm Password
                </Text>
                <View
                  className={`flex-row items-center border-2 rounded-lg px-4 py-3 ${
                    errors.confirmPassword
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <TextInput
                    className="flex-1 text-base font-medium"
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: "" });
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <Text className="text-blue-600 font-semibold text-sm">
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text className="text-red-600 text-sm mt-2">
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isLoading}
                className={`py-4 rounded-lg items-center justify-center ${
                  isLoading ? "bg-blue-400" : "bg-blue-600"
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
