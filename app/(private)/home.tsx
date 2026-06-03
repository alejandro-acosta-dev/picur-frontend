import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const { colors, isDark, toggle } = useTheme();
  const userName = "Admin";

  // ── Animación de pulso (punto verde) ──
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  // ── Animación de entrada ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1.8, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, salir", style: "destructive", onPress: () => router.replace("/login") },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.cardBorder }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoBox, { backgroundColor: "#2563eb22" }]}>
              <Ionicons name="snow-outline" size={20} color="#2563eb" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>FrigoSafe</Text>
              <Text style={[styles.headerSub, { color: colors.subtext }]}>Cadena de frío</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={toggle}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={18}
                color={isDark ? "#f59e0b" : "#6b7280"}
              />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: "#ef444415", borderColor: "#ef444430" }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── Bienvenida ── */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Bienvenido, {userName} 👋
              </Text>
              <Text style={[styles.welcomeSub, { color: colors.subtext }]}>
                Monitoreo inteligente de vacunas en tiempo real
              </Text>
            </View>

            {/* ── Estado del sistema ── */}
            <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.statusLeft}>
                <View style={styles.dotContainer}>
                  <Animated.View
                    style={[
                      styles.dotPulse,
                      { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                    ]}
                  />
                  <View style={styles.dotCore} />
                </View>
                <View>
                  <Text style={[styles.statusTitle, { color: colors.text }]}>Sistema activo</Text>
                  <Text style={[styles.statusDesc, { color: colors.subtext }]}>
                    Monitoreo en tiempo real 24/7
                  </Text>
                </View>
              </View>
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineBadgeText}>EN LÍNEA</Text>
              </View>
            </View>

            {/* ── Sección acceso rápido ── */}
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>ACCESO RÁPIDO</Text>

            {/* Card grande — Dashboard */}
            <Pressable
              style={[styles.cardLarge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => router.push("/dashboard")}
            >
              <View style={[styles.cardIconLarge, { backgroundColor: "#2563eb18" }]}>
                <Ionicons name="speedometer-outline" size={30} color="#2563eb" />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Dashboard</Text>
                <Text style={[styles.cardDesc, { color: colors.subtext }]}>
                  Temperatura, estado del sensor y alertas en tiempo real
                </Text>
              </View>
              <View style={[styles.cardArrow, { backgroundColor: colors.cardBorder }]}>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </View>
            </Pressable>

            {/* Dos cards pequeñas */}
            <View style={styles.cardRow}>
              <Pressable
                style={[styles.cardSmall, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => router.push("/chat-ai")}
              >
                <View style={[styles.cardIconSmall, { backgroundColor: "#7c3aed18" }]}>
                  <Ionicons name="hardware-chip-outline" size={22} color="#7c3aed" />
                </View>
                <Text style={[styles.cardTitleSmall, { color: colors.text }]}>FrigoSafe IA</Text>
                <Text style={[styles.cardDescSmall, { color: colors.subtext }]}>
                  Asistente inteligente de análisis
                </Text>
                <View style={[styles.cardArrowSmall, { backgroundColor: colors.cardBorder }]}>
                  <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                </View>
              </Pressable>

              <Pressable
                style={[styles.cardSmall, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => router.push("/listUsuarios")}
              >
                <View style={[styles.cardIconSmall, { backgroundColor: "#0891b218" }]}>
                  <Ionicons name="people-outline" size={22} color="#0891b2" />
                </View>
                <Text style={[styles.cardTitleSmall, { color: colors.text }]}>Usuarios</Text>
                <Text style={[styles.cardDescSmall, { color: colors.subtext }]}>
                  Gestión de acceso al sistema
                </Text>
                <View style={[styles.cardArrowSmall, { backgroundColor: colors.cardBorder }]}>
                  <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                </View>
              </Pressable>
            </View>

            {/* ── Info card ── */}
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: "#2563eb30" }]}>
              <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
              <Text style={[styles.infoText, { color: colors.subtext }]}>
                Rango seguro de almacenamiento:{" "}
                <Text style={{ color: "#2563eb", fontWeight: "600" }}>2°C – 8°C</Text>
                {" "}· Estándar OPS/OMS para vacunas
              </Text>
            </View>

            {/* ── Footer ── */}
            <View style={styles.footer}>
              <Ionicons name="shield-checkmark-outline" size={12} color={colors.muted} />
              <Text style={[styles.footerText, { color: colors.muted }]}>
                FrigoSafe · Sistema de monitoreo certificado
              </Text>
            </View>

          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  headerSub: { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  // ── Scroll ──
  scroll: { padding: 20, paddingBottom: 48 },

  // ── Bienvenida ──
  welcomeSection: { marginBottom: 20, marginTop: 4 },
  welcomeTitle: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  welcomeSub: { fontSize: 14, lineHeight: 20 },

  // ── Status ──
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 28,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  dotContainer: { width: 24, height: 24, justifyContent: "center", alignItems: "center" },
  dotPulse: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#22c55e",
  },
  dotCore: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#22c55e" },
  statusTitle: { fontSize: 15, fontWeight: "700" },
  statusDesc: { fontSize: 12, marginTop: 1 },
  onlineBadge: {
    backgroundColor: "#22c55e18",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e40",
  },
  onlineBadgeText: { color: "#22c55e", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  // ── Section label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginBottom: 12,
  },

  // ── Card grande ──
  cardLarge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 14,
  },
  cardIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 3 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Cards pequeñas ──
  cardRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  cardSmall: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  cardIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitleSmall: { fontSize: 14, fontWeight: "700" },
  cardDescSmall: { fontSize: 12, lineHeight: 16 },
  cardArrowSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  // ── Info card ──
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  footerText: { fontSize: 11 },
});
