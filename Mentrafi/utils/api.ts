import { Platform } from "react-native";

const isEmulator = Platform.OS === "android" && !__DEV__;

export const API_URL = isEmulator
  ? "http://10.0.2.2:3001"
  : "http://192.168.1.44:3001";