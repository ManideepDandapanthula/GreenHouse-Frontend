import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const COLORS = ["#ff6b6b", "#4ecdc4", "#f7b731", "#45b7d1", "#9b59b6"];

export default function GreenhouseDashboard() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("greenhouseHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3637/api/greenhouse/latest`,
      );

      const formatted = res.data.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        temperature: item.temperature,
        humidity: item.humidity,
        soil: item.soilMoisture,
        light: item.light,
        co2: item.co2,
      }));

      setHistory(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Save chart data locally so it doesn't vanish on page change
  useEffect(() => {
    localStorage.setItem("greenhouseHistory", JSON.stringify(history));
  }, [history]);

  // Auto refresh every 20s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const latest = history[history.length - 1];

  const pieData = latest
    ? [
        { name: "Temp", value: latest.temperature },
        { name: "Humidity", value: latest.humidity },
        { name: "Soil", value: latest.soil },
        { name: "Light", value: latest.light },
        { name: "CO₂", value: latest.co2 },
      ]
    : [];

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>🌿 Smart Greenhouse Dashboard</h1>

      <div style={styles.topBar}>
        <button style={styles.historyBtn} onClick={() => navigate("/history")}>
          📊 View Sensor History
        </button>
      </div>

      {latest && (
        <div style={styles.pieCard}>
          <h3>Latest Environmental Snapshot</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={110} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.grid}>
        {["temperature", "humidity", "soil", "light", "co2"].map((key, i) => (
          <ChartCard
            key={key}
            title={key.toUpperCase()}
            data={history}
            dataKey={key}
            color={COLORS[i]}
          />
        ))}
      </div>
    </div>
  );
}

const ChartCard = ({ title, data, dataKey, color }) => (
  <div style={styles.card}>
    <h3>{title}</h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} barSize={5} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#141e30",
    padding: 30,
    color: "#fff",
  },
  header: { textAlign: "center", marginBottom: 20 },
  topBar: { textAlign: "center", marginBottom: 20 },
  historyBtn: {
    padding: "10px 18px",
    borderRadius: 8,
    background: "#4ecdc4",
    border: "none",
  },
  pieCard: {
    background: "#1f2b3a",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: 20,
  },
  card: { background: "#1f2b3a", padding: 15, borderRadius: 15 },
};
