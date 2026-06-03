import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { cleanHistory } from "@/services/chatHistory.service";
import { getReadings } from "@/services/hardware.service";
import { sendAlertNotification } from "@/services/notification.service";
import { HardwareReading } from "@/interfaces/HardwareReading";
import { GetNotification } from "@/utils/notification";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - 40;

const TEMP_SAFE_LOW = 2;
const TEMP_SAFE_HIGH = 8;
const TEMP_MIN_DISPLAY = 0;
const TEMP_MAX_DISPLAY = 12;

const safeStartPct =
  ((TEMP_SAFE_LOW - TEMP_MIN_DISPLAY) / (TEMP_MAX_DISPLAY - TEMP_MIN_DISPLAY)) * 100;
const safeWidthPct =
  ((TEMP_SAFE_HIGH - TEMP_SAFE_LOW) / (TEMP_MAX_DISPLAY - TEMP_MIN_DISPLAY)) * 100;

const POLL_INTERVAL_MS = 5_000;

// ── Helpers para derivar datos del array de lecturas ─────────────────────────

// Garantiza que el timestamp se interprete como UTC aunque el backend omita la 'Z'
function toUtcMs(ts: string): number {
  const normalized =
    ts.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(ts) ? ts : ts + "Z";
  return new Date(normalized).getTime();
}

function deriveLatest(readings: HardwareReading[]): HardwareReading | null {
  if (!readings.length) return null;
  return readings.reduce((a, b) =>
    toUtcMs(a.timestamp) > toUtcMs(b.timestamp) ? a : b,
  );
}

function deriveLast24hChart(readings: HardwareReading[]): {
  labels: string[];
  temps: number[];
} {
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;
  const recent = readings
    .filter((r) => toUtcMs(r.timestamp) >= cutoff)
    .sort((a, b) => toUtcMs(a.timestamp) - toUtcMs(b.timestamp));

  if (recent.length === 0)
    return { labels: ["--:--", "--:--", "--:--", "--:--", "--:--", "--:--", "--:--"], temps: [5, 5, 5, 5, 5, 5, 5] };

  const MAX_POINTS = 7;
  const sampled =
    recent.length <= MAX_POINTS
      ? recent
      : Array.from({ length: MAX_POINTS }, (_, i) =>
          recent[Math.round((i / (MAX_POINTS - 1)) * (recent.length - 1))],
        );

  return {
    labels: sampled.map((r) => {
      const d = new Date(r.timestamp);
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    }),
    temps: sampled.map((r) => r.temperature),
  };
}

function deriveLast7Days(readings: HardwareReading[]) {
  const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return Array.from({ length: 7 }, (_, i) => {
    const ago = 6 - i;
    const d = new Date();
    d.setDate(d.getDate() - ago);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    const day = readings.filter((r) => {
      const t = toUtcMs(r.timestamp);
      return t >= start && t < end;
    });
    const avg =
      day.length > 0
        ? day.reduce((s, r) => s + r.temperature, 0) / day.length
        : 0;
    return { label: dayLabels[d.getDay()], value: parseFloat(avg.toFixed(1)) };
  });
}

function deriveTimeOutOfRangeSecs(readings: HardwareReading[]): number {
  const cutoff = Date.now() - 60 * 60 * 1000;
  const recent = readings
    .filter((r) => toUtcMs(r.timestamp) >= cutoff)
    .sort((a, b) => toUtcMs(a.timestamp) - toUtcMs(b.timestamp));
  if (recent.length < 2) return 0;
  let secs = 0;
  for (let i = 0; i < recent.length - 1; i++) {
    if (
      recent[i].temperature < TEMP_SAFE_LOW ||
      recent[i].temperature > TEMP_SAFE_HIGH
    ) {
      secs += (toUtcMs(recent[i + 1].timestamp) - toUtcMs(recent[i].timestamp)) / 1000;
    }
  }
  return Math.round(secs);
}

// ── Historial de alertas ──────────────────────────────────────────────────────

const ALERT_MAX = 15;

function deriveAlertHistory(readings: HardwareReading[]) {
  return readings
    .filter(
      (r) =>
        r.temperature < TEMP_SAFE_LOW ||
        r.temperature > TEMP_SAFE_HIGH ||
        r.door,
    )
    .sort((a, b) => toUtcMs(b.timestamp) - toUtcMs(a.timestamp))
    .slice(0, ALERT_MAX);
}

function alertSeverity(r: HardwareReading): "critical" | "warning" {
  if (r.temperature < 1 || r.temperature > 10) return "critical";
  return "warning";
}

function alertItemMessage(r: HardwareReading): string {
  const t = r.temperature;
  if (r.door && (t < TEMP_SAFE_LOW || t > TEMP_SAFE_HIGH))
    return `${t.toFixed(2)}°C y puerta abierta — riesgo elevado`;
  if (t < 1) return `Crítico: ${t.toFixed(2)}°C — riesgo de congelación`;
  if (t > 10) return `Crítico: ${t.toFixed(2)}°C — cadena de frío comprometida`;
  if (t > TEMP_SAFE_HIGH)
    return `${t.toFixed(2)}°C — ${(t - TEMP_SAFE_HIGH).toFixed(2)}°C sobre el límite`;
  if (t < TEMP_SAFE_LOW)
    return `${t.toFixed(2)}°C — ${(TEMP_SAFE_LOW - t).toFixed(2)}°C bajo el límite`;
  if (r.door) return `Puerta abierta — temp. ${t.toFixed(2)}°C`;
  return `Alerta: ${t.toFixed(2)}°C`;
}

// ── Gráfico de barras ─────────────────────────────────────────────────────────

const BAR_H = 140;

const barColor = (v: number) => {
  if (v > TEMP_SAFE_HIGH) return "#ef4444";
  if (v > TEMP_SAFE_HIGH * 0.9) return "#f59e0b";
  return "#22c55e";
};

function WeeklyBarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), TEMP_SAFE_HIGH + 1);
  return (
    <View>
      <View
        style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_H, gap: 6, paddingHorizontal: 4 }}
      >
        {data.map((item, i) => {
          const h = item.value > 0 ? Math.max(Math.round((item.value / maxVal) * (BAR_H - 24)), 4) : 0;
          const c = barColor(item.value);
          return (
            <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
              {item.value > 0 ? (
                <Text style={{ color: c, fontSize: 9, fontWeight: "700", marginBottom: 3 }}>
                  {item.value.toFixed(1)}°
                </Text>
              ) : (
                <Text style={{ color: "#4b5563", fontSize: 9, marginBottom: 3 }}>—</Text>
              )}
              <View
                style={{
                  height: h,
                  width: "100%",
                  backgroundColor: c,
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                  opacity: item.value > 0 ? 0.9 : 0,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ height: 1, backgroundColor: "#374151", marginTop: 1 }} />
      <View style={{ flexDirection: "row", paddingHorizontal: 4, gap: 6, marginTop: 6 }}>
        {data.map((item, i) => (
          <Text
            key={i}
            style={{ flex: 1, textAlign: "center", color: "#9ca3af", fontSize: 10, fontWeight: "600" }}
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
  const [readings, setReadings] = useState<HardwareReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const lastAlertedTimestampRef = useRef<string | null>(null);

  const fetchReadings = useCallback(async () => {
    try {
      const data = await getReadings();
      setReadings(data);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Sin conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReadings();
      const interval = setInterval(fetchReadings, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [fetchReadings]),
  );

  // ── Alerta WhatsApp — una vez por lectura nueva que esté en alerta ────────
  useEffect(() => {
    const latest = deriveLatest(readings);
    if (!latest) return;

    // Si ya alertamos sobre esta lectura exacta, no repetir
    if (lastAlertedTimestampRef.current === latest.timestamp) return;

    const t = latest.temperature;
    const currentStatus =
      t < 1 || t > 10 ? "CRÍTICO"
      : t < TEMP_SAFE_LOW || t > TEMP_SAFE_HIGH || latest.door ? "RIESGO"
      : "NORMAL";

    if (currentStatus === "NORMAL") return;

    const isOutOfRange = t < TEMP_SAFE_LOW || t > TEMP_SAFE_HIGH;
    const isDoorOpen = latest.door;

    const msg =
      currentStatus === "CRÍTICO"
        ? `Temperatura crítica: ${t.toFixed(2)}°C — Acción inmediata requerida.${isDoorOpen ? " Puerta abierta." : ""}`
        : isOutOfRange && isDoorOpen
          ? `Temperatura ${t.toFixed(2)}°C fuera del rango seguro y puerta abierta — Riesgo elevado.`
          : isOutOfRange
            ? `Temperatura en riesgo: ${t.toFixed(2)}°C — Fuera del rango seguro (2°C–8°C).`
            : `Puerta abierta — Temperatura ${t.toFixed(2)}°C en rango seguro. Cerrar inmediatamente.`;

    sendAlertNotification(msg).catch(() => {});
    lastAlertedTimestampRef.current = latest.timestamp;
  }, [readings]);

  // ── Datos derivados ───────────────────────────────────────────────────────
  const reading = deriveLatest(readings);
  const weeklyData = deriveLast7Days(readings);
  const { labels: lineLabels, temps: tempReadings } = deriveLast24hChart(readings);
  const refMin = Array(lineLabels.length).fill(TEMP_SAFE_LOW);
  const refMax = Array(lineLabels.length).fill(TEMP_SAFE_HIGH);
  const timeOutOfRangeSecs = reading ? deriveTimeOutOfRangeSecs(readings) : 0;
  const alertHistory = deriveAlertHistory(readings);

  const lastAlert = (() => {
    if (!reading) return "Sin datos disponibles";

    const t = reading.temperature;
    const diff = (v: number) => Math.abs(v).toFixed(2);

    // Crítico + puerta abierta
    if ((t < 1 || t > 10) && reading.door)
      return `Temperatura ${t.toFixed(2)}°C y puerta abierta — Riesgo elevado de pérdida de cadena de frío. Actuar de inmediato.`;

    // Crítico por debajo
    if (t < 1)
      return `Temperatura crítica: ${t.toFixed(2)}°C — Riesgo de congelación de vacunas (${diff(t - 2)}°C bajo el mínimo). Revisar equipo de inmediato.`;

    // Crítico por encima
    if (t > 10)
      return `Temperatura crítica: ${t.toFixed(2)}°C — Supera el límite máximo por ${diff(t - TEMP_SAFE_HIGH)}°C. Cadena de frío comprometida. Verificar equipo.`;

    // Riesgo fuera de rango + puerta abierta
    if ((t < TEMP_SAFE_LOW || t > TEMP_SAFE_HIGH) && reading.door)
      return `Temperatura ${t.toFixed(2)}°C y puerta abierta — Fuera del rango seguro (2°C–8°C). Cerrar puerta y monitorear.`;

    // Riesgo por encima del rango
    if (t > TEMP_SAFE_HIGH)
      return `Temperatura en riesgo: ${t.toFixed(2)}°C — ${diff(t - TEMP_SAFE_HIGH)}°C por encima del rango seguro (2°C–8°C). Monitorear de cerca.`;

    // Riesgo por debajo del rango
    if (t < TEMP_SAFE_LOW)
      return `Temperatura en riesgo: ${t.toFixed(2)}°C — ${diff(TEMP_SAFE_LOW - t)}°C por debajo del rango seguro (2°C–8°C). Verificar configuración.`;

    // Puerta abierta con temperatura normal
    if (reading.door)
      return `Puerta abierta — Cerrar inmediatamente para preservar la cadena de frío. Temperatura actual: ${t.toFixed(2)}°C.`;

    // Todo normal
    return `Sin alertas — Temperatura ${t.toFixed(2)}°C dentro del rango seguro (2°C–8°C). Puerta cerrada.`;
  })();

  // ── Pantalla de carga inicial ────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>
          Cargando datos del sensor…
        </Text>
      </View>
    );
  }

  // ── Sin datos ────────────────────────────────────────────────────────────
  if (!reading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <Ionicons name="warning-outline" size={48} color="#f59e0b" />
        <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginTop: 16, textAlign: "center" }}>
          {error ?? "Sin lecturas disponibles"}
        </Text>
        <Pressable
          onPress={fetchReadings}
          style={{ marginTop: 20, backgroundColor: "#2563eb", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  // ── Lógica de estado ─────────────────────────────────────────────────────
  const isInRange =
    reading.temperature >= TEMP_SAFE_LOW && reading.temperature <= TEMP_SAFE_HIGH;

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
      ((reading.temperature - TEMP_MIN_DISPLAY) / (TEMP_MAX_DISPLAY - TEMP_MIN_DISPLAY)) * 100,
      0,
    ),
    100,
  );

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    if (m <= 0) return "0 min";
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}min` : `${m} min`;
  };

  const relativeTime = (iso: string) => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Indicador de refresco ── */}
        {error && (
          <View style={{ backgroundColor: "#7f1d1d22", borderColor: "#ef4444", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={16} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontSize: 12 }}>{error} — mostrando último dato conocido</Text>
          </View>
        )}

        {/* ── Estado general ── */}
        <View style={[styles.statusBanner, { backgroundColor: statusColor + "22", borderColor: statusColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          <Text style={styles.timestampText}>{relativeTime(reading.timestamp)}</Text>
        </View>

        {/* ── Temperatura actual ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="thermometer-outline" size={18} color="#9ca3af" />
            <Text style={styles.cardTitle}>Temperatura</Text>
          </View>

          <Text style={[styles.tempValue, { color: tempColor }]}>
            {reading.temperature.toFixed(2)}°C
          </Text>
          <Text style={[styles.tempSubtitle, { color: tempColor }]}>
            {isInRange ? "Dentro del rango seguro" : "Fuera del rango seguro"}
          </Text>

          <View style={styles.barContainer}>
            <View style={styles.bar}>
              <View
                style={[
                  styles.safeZone,
                  { left: `${safeStartPct}%` as any, width: `${safeWidthPct}%` as any },
                ]}
              />
            </View>
            <View style={[styles.indicator, { left: `${indicatorPct}%` as any }]}>
              <View style={[styles.indicatorDot, { backgroundColor: tempColor }]} />
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
            <Text style={[styles.cardValue, { color: reading.door ? "#ef4444" : "#22c55e" }]}>
              {reading.door ? "Abierta" : "Cerrada"}
            </Text>
            {reading.door && <Text style={styles.doorWarning}>Revisar estado</Text>}
          </View>

          <View style={[styles.card, styles.halfCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="timer-outline" size={18} color="#9ca3af" />
              <Text style={styles.cardTitle}>Fuera de rango</Text>
            </View>
            <Text style={[styles.cardValue, { color: timeOutOfRangeSecs > 0 ? "#f59e0b" : "#22c55e" }]}>
              {formatSecs(timeOutOfRangeSecs)}
            </Text>
          </View>
        </View>

        {/* ── Última alerta ── */}
        <View style={styles.alertCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning-outline" size={18} color="#f59e0b" />
            <Text style={styles.cardTitle}>Última alerta</Text>
          </View>
          <Text style={styles.alertText}>{lastAlert}</Text>
        </View>

        {/* ═══ GRÁFICOS ═══ */}
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics-outline" size={15} color="#6b7280" />
          <Text style={styles.sectionTitle}>Análisis de temperatura</Text>
          {lastUpdated && (
            <Text style={{ color: "#4b5563", fontSize: 10, marginLeft: "auto" }}>
              Fecha del sistema {lastUpdated.getHours().toString().padStart(2,"0")}:{lastUpdated.getMinutes().toString().padStart(2,"0")}:{lastUpdated.getSeconds().toString().padStart(2,"0")}
            </Text>
          )}
        </View>

        {/* ── Gráfico de líneas — últimas 24 horas ── */}
        <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 0 }]}>
          <View style={[styles.cardHeader, { paddingHorizontal: 16 }]}>
            <Ionicons name="trending-up-outline" size={18} color="#9ca3af" />
            <Text style={styles.cardTitle}>Últimas 24 horas</Text>
          </View>

          {/* Etiqueta eje Y */}
          <Text style={{ color: "#6b7280", fontSize: 10, paddingHorizontal: 16, marginBottom: 2 }}>
            ↑ Temperatura (°C)
          </Text>

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
              propsForBackgroundLines: { stroke: "#2d3748", strokeDasharray: "5,5" },
            }}
            style={{ borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}
          />

          {/* Etiqueta eje X */}
          <Text style={{ color: "#6b7280", fontSize: 10, textAlign: "center", marginTop: 4 }}>
            Hora →
          </Text>

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
            <Text style={styles.cardTitle}>Promedio diario · últimos 7 días</Text>
          </View>

          <WeeklyBarChart data={weeklyData} />

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

      {/* ── Modal historial de alertas ── */}
      <Modal
        visible={showAlerts}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlerts(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAlerts(false)}>
          <Pressable style={styles.modalContainer} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Ionicons name="notifications-outline" size={20} color="white" />
              <Text style={styles.modalTitle}>Historial de alertas</Text>
              <Text style={styles.modalSubtitle}>Últimas {ALERT_MAX} alertas</Text>
              <Pressable onPress={() => setShowAlerts(false)} style={{ marginLeft: "auto" }}>
                <Ionicons name="close" size={22} color="#9ca3af" />
              </Pressable>
            </View>

            {alertHistory.length === 0 ? (
              <View style={styles.noAlertsContainer}>
                <Ionicons name="checkmark-circle-outline" size={40} color="#22c55e" />
                <Text style={styles.noAlertsText}>Sin alertas registradas</Text>
              </View>
            ) : (
              <FlatList
                data={alertHistory}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => {
                  const severity = alertSeverity(item);
                  const color = severity === "critical" ? "#ef4444" : "#f59e0b";
                  return (
                    <View style={[styles.alertItem, { borderLeftColor: color }]}>
                      <View style={styles.alertItemRow}>
                        <Ionicons
                          name={severity === "critical" ? "alert-circle-outline" : "warning-outline"}
                          size={15}
                          color={color}
                        />
                        <Text style={[styles.alertItemBadge, { color, borderColor: color }]}>
                          {severity === "critical" ? "CRÍTICO" : "RIESGO"}
                        </Text>
                        <Text style={styles.alertItemTime}>
                          {relativeTime(item.timestamp)}
                        </Text>
                        <Text style={styles.alertItemIndex}>#{alertHistory.length - index}</Text>
                      </View>
                      <Text style={styles.alertItemMsg}>{alertItemMessage(item)}</Text>
                    </View>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Botones flotantes ── */}
      <Pressable style={styles.deleteChatButton} onPress={confirmDeleteHistory}>
        <Ionicons name="trash" size={24} color="white" />
      </Pressable>

      {/* ── Botón campana ── */}
      <Pressable style={styles.bellButton} onPress={() => setShowAlerts(true)}>
        <Ionicons name="notifications-outline" size={24} color="#f59e0b" />
        {alertHistory.length > 0 && (
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>
              {alertHistory.length > 9 ? "9+" : alertHistory.length}
            </Text>
          </View>
        )}
      </Pressable>

      <View style={styles.aiWrapper}>
        <View style={styles.aiTooltip}>
          <Text style={styles.aiTooltipText}>Pregúntale a la IA</Text>
        </View>
        <Pressable style={styles.aiButton} onPress={() => router.push("/chat-ai")}>
          <Ionicons name="hardware-chip" size={28} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },

  scroll: { padding: 20, paddingBottom: 170 },

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

  card: { backgroundColor: "#1f2937", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { color: "#9ca3af", fontSize: 13, fontWeight: "500" },

  tempValue: { fontSize: 52, fontWeight: "800", letterSpacing: -1, marginBottom: 4 },
  tempSubtitle: { fontSize: 13, fontWeight: "500", marginBottom: 20 },

  barContainer: { position: "relative", marginBottom: 10 },
  bar: { height: 12, backgroundColor: "#374151", borderRadius: 6, overflow: "hidden" },
  safeZone: { position: "absolute", height: "100%", backgroundColor: "#22c55e", opacity: 0.65 },
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

  row: { flexDirection: "row", gap: 12 },
  halfCard: { flex: 1 },
  cardValue: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  doorWarning: { color: "#f59e0b", fontSize: 11, fontWeight: "500" },

  alertCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    marginBottom: 12,
  },
  alertText: { color: "white", fontSize: 14, fontWeight: "500" },

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
  lineSample: { width: 22, height: 2, backgroundColor: "#3b82f6", borderRadius: 1 },
  refLineSample: { width: 22, height: 2, backgroundColor: "#22c55e", borderRadius: 1 },
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

  // ── Bell button ──
  bellButton: {
    position: "absolute",
    bottom: 235,
    right: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  bellBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  bellBadgeText: { color: "white", fontSize: 10, fontWeight: "700" },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 34,
    maxHeight: "75%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  modalTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  modalSubtitle: { color: "#6b7280", fontSize: 12 },
  noAlertsContainer: { alignItems: "center", paddingVertical: 40, gap: 12 },
  noAlertsText: { color: "#6b7280", fontSize: 14 },
  alertItem: {
    backgroundColor: "#1f2937",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  alertItemRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  alertItemBadge: {
    fontSize: 10,
    fontWeight: "700",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  alertItemTime: { color: "#6b7280", fontSize: 11, marginLeft: 2 },
  alertItemIndex: { color: "#4b5563", fontSize: 10, marginLeft: "auto" },
  alertItemMsg: { color: "#d1d5db", fontSize: 13 },

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
