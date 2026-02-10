import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
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

const CHANNEL_ID = process.env.THNIGKSPEAK_CHANNEL_ID;
const API_KEY = process.env.THNIGKSPEAK_READ_API_KEY;
const COLORS = ["#ff6b6b", "#4ecdc4", "#f7b731", "#45b7d1", "#9b59b6"];

const GreenhouseDashboard = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${API_KEY}&results=1`,
      );

      const feed = res.data.feeds[0];

      const newEntry = {
        time: new Date(feed.created_at).toLocaleTimeString(),
        temperature: Number(feed.field1),
        humidity: Number(feed.field3),
        soil: Number(feed.field4),
        light: Number(feed.field5),
        co2: Number(feed.field6),
      };

      setHistory((prev) => [...prev.slice(-19), newEntry]);

      await axios.post(
        "https://greenhouse-backend-4.onrender.com/api/greenhouse",
        {
          temperature: newEntry.temperature,
          humidity: newEntry.humidity,
          soilMoisture: newEntry.soil,
          light: newEntry.light,
          co2: newEntry.co2,
          timestamp: feed.created_at,
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

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
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.grid}>
        <ChartCard
          title="Temperature (°C)"
          data={history}
          dataKey="temperature"
          color="#ff6b6b"
        />
        <ChartCard
          title="Humidity (%)"
          data={history}
          dataKey="humidity"
          color="#4ecdc4"
        />
        <ChartCard
          title="Soil Moisture (%)"
          data={history}
          dataKey="soil"
          color="#f7b731"
        />
        <ChartCard
          title="Light Intensity (lx)"
          data={history}
          dataKey="light"
          color="#45b7d1"
        />
        <ChartCard
          title="CO₂ Level"
          data={history}
          dataKey="co2"
          color="#9b59b6"
        />
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <p>
          <strong>Time:</strong> {label}
        </p>
        <p>
          <strong>Value:</strong> {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const ChartCard = React.memo(({ title, data, dataKey, color }) => (
  <div
    style={styles.card}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <h3>{title}</h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} barSize={5} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    padding: "30px 40px",
    color: "white",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  topBar: {
    textAlign: "center",
    marginBottom: "20px",
  },
  historyBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#4ecdc4",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  pieCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "30px",
    backdropFilter: "blur(10px)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "15px",
    borderRadius: "15px",
    backdropFilter: "blur(10px)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  tooltip: {
    background: "rgba(0,0,0,0.85)",
    padding: "10px 14px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "13px",
  },
};

export default GreenhouseDashboard;
