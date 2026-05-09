import { cleanHistory } from "@/services/chatHistory.service";
import { GetNotification } from "@/utils/notification";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const SCREEN_W = Dimensions.get("window").width;
// chart-kit incluye el eje Y en su ancho total — usamos el ancho completo menos padding del contenedor
const CHART_W = SCREEN_W - 40;

const TEMP_SAFE_LOW = 2;
const TEMP_SAFE_HIGH = 8;
const TEMP_MIN_DISPLAY = 0;
const TEMP_MAX_DISPLAY = 12;

const safeStartPct =
  ((TEMP_SAFE_LOW - TEMP_MIN_DISPLAY) /
    (TEMP_MAX_DISPLAY - TEMP_MIN_DISPLAY)) *
  100;
const safeWidthPct =
  ((TEMP_SAFE_HIGH - TEMP_SAFE_LOW) /
    (TEMP_MAX_DISPLAY - TEMP_MIN_DISPLAY)) *
  100;

// ── Datos quemados — misma estructura que la DB (Id, Temperature, Timestamp, Door) ──

// Lecturas horarias → simplificadas a 7 puntos (cada ~4 horas) para mejor legibilidad
const lineLabels = ["00h", "04h", "08h", "12h", "16h", "20h", "23h"];
const tempReadings = [4.2, 4.4, 5.3, 8.4, 7.2, 5.4, 9.1];
const refMin = Array(7).fill(TEMP_SAFE_LOW);
const refMax = Array(7).fill(TEMP_SAFE_HIGH);

// Promedios diarios — últimos 7 días
const getDay = (ago: number) => {
  const labels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const d = new Date();
  d.setDate(d.getDate() - ago);
  return labels[d.getDay()];
};

const weeklyData = [
  { label: getDay(6), value: 4.8 },
  { label: getDay(5), value: 5.2 },
  { label: getDay(4), value: 4.9 },
  { label: getDay(3), value: 5.5 },
  { label: getDay(2), value: 6.1 },
  { label: getDay(1), value: 8.7 },
  { label: getDay(0), value: 7.1 },
];

const barColor = (v: number) => {
  if (v > TEMP_SAFE_HIGH) return "#ef4444";
  if (v > TEMP_SAFE_HIGH * 0.9) return "#f59e0b";
  return "#22c55e";
};

// ── Gráfico de barras personalizado (per-bar color) ──────────────────────────
const BAR_H = 140;

function WeeklyBarChart() {
  const maxVal = Math.max(...weeklyData.map((d) => d.value), TEMP_SAFE_HIGH + 1);
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          height: BAR_H,
          gap: 6,
          paddingHorizontal: 4,
        }}
      >
        {weeklyData.map((item, i) => {
          const h = Math.round((item.value / maxVal) * (BAR_H - 24));
          const c = barColor(item.value);
          return (
            <View
              key={i}
              style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}
            >
              <Text
                style={{
                  color: c,
                  fontSize: 9,
                  fontWeight: "700",
                  marginBottom: 3,
                }}
              >
                {item.value.toFixed(1)}°
              </Text>
              <View
                style={{
                  height: h,
                  width: "100%",
                  backgroundColor: c,
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  opacity: 0.9,
                }}
              />
            </View>
          );
        })}
      </View>

      {/* Eje X */}
      <View style={{ height: 1, backgroundColor: "#374151", marginTop: 1 }} />
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 4,
          gap: 6,
          marginTop: 6,
        }}
      >
        {weeklyData.map((item, i) => (
          <Text
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const reading = {
    id: 1,
    temperature: 9.1,
    timestamp: new Date(Date.now() - 30000),
    door: true,
  };

  const extraData = {
    timeOutOfRangeSecs: 180,
    lastAlert: "Temperatura fuera del rango seguro",
  };

  const isInRange =
    reading.temperature >= TEMP_SAFE_LOW &&
    reading.temperature <= TEMP_SAFE_HIGH;

  const getStatus = (): "NORMAL" | "RIESGO" | "CRÍTICO" => {
    if (reading.temperature < 1 || reading.temperature > 10) return "CRÍTICO";
    if (!isInRange || reading.door) return "RIESGO";
    return "NORMAL";
  };

  const status = getStatus();
  const statusColor = { NORMAL: "#22c55e", RIESGO: "#f59e0b", CRÍTICO: "#ef4444" }[status];
  const tempColor =
    isInRange ? "#22c55e"
    : reading.temperature < 1 || reading.temperature > 10 ? "#ef4444"
    : "#f59e0b";

  const indicatorPct = Math.min(
    Math.max(
      ((reading.temperature - TEMP_MIN_DISPLAY) /
        (TEMP_MAX_DISPLAY - TEMP_MIN_DISPLAY)) *
        100,
      0,
    ),
    100,
  );

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const relativeTime = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `hace ${s}s`;
    const m = Math.floor(s / 60);
    return m < 60 ? `hace ${m}min` : `hace ${Math.floor(m / 60)}h`;
  };

  const confirmDeleteHistory = () =>
    Alert.alert(
      "Eliminar historial",
      "¿Estás seguro de eliminar todo el historial del chat?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: handleCleanHistory },
      ],
    );

  const handleCleanHistory = async () => {
    const result = await cleanHistory();
    GetNotification(
      result.ok
        ? "Historial de chat limpiado correctamente!"
        : "Error al limpiar el historial de chat",
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Estado general ── */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: statusColor + "22", borderColor: statusColor },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
          <Text style={styles.timestampText}>
            {relativeTime(reading.timestamp)}
          </Text>
        </View>

        {/* ── Temperatura actual ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="thermometer-outline" size={18} color="#9ca3af" />
            <Text style={styles.cardTitle}>Temperatura</Text>
          </View>

          <Text style={[styles.tempValue, { color: tempColor }]}>
            {reading.temperature.toFixed(1)}°C
          </Text>
          <Text style={[styles.tempSubtitle, { color: tempColor }]}>
            {isInRange ? "Dentro del rango seguro" : "Fuera del rango seguro"}
          </Text>

          {/* Barra visual de rango */}
          <View style={styles.barContainer}>
            <View style={styles.bar}>
              <View
                style={[
                  styles.safeZone,
                  {
                    left: `${safeStartPct}%` as any,
                    width: `${safeWidthPct}%` as any,
                  },
                ]}
              />
            </View>
            <View
              style={[styles.indicator, { left: `${indicatorPct}%` as any }]}
            >
              <View
                style={[styles.indicatorDot, { backgroundColor: tempColor }]}
              />
            </View>
          </View>

          <View style={styles.barLabels}>
            <Text style={styles.barLabelEdge}>{TEMP_MIN_DISPLAY}°C</Text>
            <Text style={styles.barLabelSafe}>
              Seguro: {TEMP_SAFE_LOW}°C – {TEMP_SAFE_HIGH}°C
            </Text>
            <Text style={styles.barLabelEdge}>{TEMP_MAX_DISPLAY}°C</Text>
          </View>
        </View>

        {/* ── Puerta + Tiempo fuera de rango ── */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name={reading.door ? "lock-open-outline" : "lock-closed-outline"}
                size={18}
                color={reading.door ? "#ef4444" : "#22c55e"}
              />
              <Text style={styles.cardTitle}>Puerta</Text>
            </View>
            <Text
              style={[
                styles.cardValue,
                { color: reading.door ? "#ef4444" : "#22c55e" },
              ]}
            >
              {reading.door ? "Abierta" : "Cerrada"}
            </Text>
            {reading.door && (
              <Text style={styles.doorWarning}>Revisar estado</Text>
            )}
          </View>

          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="timer-outline" size={18} color="#9ca3af" />
              <Text style={styles.cardTitle}>Fuera de rango</Text>
            </View>
            <Text
              style={[
                styles.cardValue,
                {
                  color:
                    extraData.timeOutOfRangeSecs > 0 ? "#f59e0b" : "#22c55e",
                },
              ]}
            >
              {formatSecs(extraData.timeOutOfRangeSecs)}
            </Text>
          </View>
        </View>

        {/* ── Última alerta ── */}
        <View style={styles.alertCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning-outline" size={18} color="#f59e0b" />
            <Text style={styles.cardTitle}>Última alerta</Text>
          </View>
          <Text style={styles.alertText}>{extraData.lastAlert}</Text>
        </View>

        {/* ═══════════════════════════════════════
              GRÁFICOS
        ════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics-outline" size={15} color="#6b7280" />
          <Text style={styles.sectionTitle}>Análisis de temperatura</Text>
        </View>

        {/* ── Gráfico de líneas — últimas 24 horas ── */}
        <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 0 }]}>
          <View style={[styles.cardHeader, { paddingHorizontal: 16 }]}>
            <Ionicons name="trending-up-outline" size={18} color="#9ca3af" />
            <Text style={styles.cardTitle}>Últimas 24 horas</Text>
          </View>

          <LineChart
            data={{
              labels: lineLabels,
              datasets: [
                {
                  data: tempReadings,
                  color: (o = 1) => `rgba(59,130,246,${o})`,
                  strokeWidth: 2,
                },
                {
                  data: refMin,
                  color: () => "rgba(34,197,94,0.55)",
                  strokeWidth: 1.5,
                  withDots: false,
                },
                {
                  data: refMax,
                  color: () => "rgba(34,197,94,0.55)",
                  strokeWidth: 1.5,
                  withDots: false,
                },
              ],
            }}
            width={CHART_W}
            height={195}
            yAxisSuffix="°"
            fromZero
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            bezier
            chartConfig={{
              backgroundColor: "#1f2937",
              backgroundGradientFrom: "#1f2937",
              backgroundGradientTo: "#1f2937",
              fillShadowGradientFrom: "rgba(59,130,246,0.35)",
              fillShadowGradientTo: "rgba(59,130,246,0.02)",
              fillShadowGradientFromOpacity: 1,
              fillShadowGradientToOpacity: 1,
              decimalPlaces: 1,
              color: (o = 1) => `rgba(59,130,246,${o})`,
              labelColor: () => "#6b7280",
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#3b82f6",
                fill: "#1f2937",
              },
              propsForBackgroundLines: {
                stroke: "#2d3748",
                strokeDasharray: "5,5",
              },
            }}
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
          />

          {/* Leyenda */}
          <View style={styles.lineLegend}>
            <View style={styles.lineSample} />
            <Text style={styles.legendText}>Temperatura registrada</Text>
            <View style={styles.refLineSample} />
            <Text style={styles.legendText}>Rango seguro (2°–8°C)</Text>
          </View>
        </View>

        {/* ── Gráfico de barras — promedio por día ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
            <Text style={styles.cardTitle}>
              Promedio diario · últimos 7 días
            </Text>
          </View>

          <WeeklyBarChart />

          {/* Leyenda */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
              <Text style={styles.legendText}>En rango</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
              <Text style={styles.legendText}>Riesgo</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
              <Text style={styles.legendText}>Crítico</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Botones flotantes (sin cambios) ── */}
      <Pressable style={styles.deleteChatButton} onPress={confirmDeleteHistory}>
        <Ionicons name="trash" size={24} color="white" />
      </Pressable>

      <View style={styles.aiWrapper}>
        <View style={styles.aiTooltip}>
          <Text style={styles.aiTooltipText}>Pregúntale a la IA</Text>
        </View>
        <Pressable
          style={styles.aiButton}
          onPress={() => router.push("/chat-ai")}
        >
          <Ionicons name="hardware-chip" size={28} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },

  scroll: { padding: 20, paddingBottom: 170 },

  // ── Status banner ──
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 16, fontWeight: "700", flex: 1 },
  timestampText: { color: "#6b7280", fontSize: 12 },

  // ── Cards ──
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: { color: "#9ca3af", fontSize: 13, fontWeight: "500" },

  // ── Temperature ──
  tempValue: {
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 4,
  },
  tempSubtitle: { fontSize: 13, fontWeight: "500", marginBottom: 20 },

  // ── Range bar ──
  barContainer: { position: "relative", marginBottom: 10 },
  bar: {
    height: 12,
    backgroundColor: "#374151",
    borderRadius: 6,
    overflow: "hidden",
  },
  safeZone: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#22c55e",
    opacity: 0.65,
  },
  indicator: { position: "absolute", top: -4, alignItems: "center" },
  indicatorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "white",
    marginLeft: -10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  barLabelEdge: { color: "#6b7280", fontSize: 11 },
  barLabelSafe: { color: "#22c55e", fontSize: 11, fontWeight: "500" },

  // ── Row (puerta + tiempo) ──
  row: { flexDirection: "row", gap: 12 },
  halfCard: { flex: 1 },
  cardValue: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  doorWarning: { color: "#f59e0b", fontSize: 11, fontWeight: "500" },

  // ── Alert card ──
  alertCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    marginBottom: 12,
  },
  alertText: { color: "white", fontSize: 14, fontWeight: "500" },

  // ── Section header ──
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Chart legends ──
  lineLegend: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  lineSample: {
    width: 22,
    height: 2,
    backgroundColor: "#3b82f6",
    borderRadius: 1,
  },
  refLineSample: {
    width: 22,
    height: 2,
    backgroundColor: "#22c55e",
    borderRadius: 1,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: "#6b7280", fontSize: 11 },

  // ── Floating buttons (unchanged) ──
  deleteChatButton: {
    position: "absolute",
    bottom: 145,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  aiWrapper: {
    position: "absolute",
    bottom: 55,
    right: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiTooltip: {
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#374151",
    justifyContent: "center",
  },
  aiTooltipText: { color: "white", fontSize: 14, fontWeight: "600" },
  aiButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});
