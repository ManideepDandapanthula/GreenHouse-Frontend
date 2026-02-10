import { useState } from "react";
import axios from "axios";

function SensorHistory() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end date/time");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        "https://greenhouse-backend-4.onrender.com/api/greenhouse/range",
        {
          params: {
            startDate,
            endDate,
          },
        },
      );
      console.log("Fetched data:", res.data);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>📅 Greenhouse Historical Data</h2>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.inputGroup}>
            <label>Start Date & Time</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>End Date & Time</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <button onClick={fetchData} style={styles.button}>
            {loading ? "Loading..." : "🔍 Fetch Data"}
          </button>
        </div>

        {/* Results */}
        <div style={styles.results}>
          {data.length === 0 && !loading && (
            <p style={{ opacity: 0.7 }}>No data found for selected range.</p>
          )}

          {data.map((item) => (
            <div key={item._id} style={styles.card}>
              <div style={styles.time}>
                🕒{" "}
                {new Date(item.timestamp || item.recordedAt).toLocaleString()}
              </div>
              <div style={styles.values}>
                🌡 {item.temperature}°C 💧 {item.humidity}% 🌱{" "}
                {item.soilMoisture}% 💡 {item.light} lx 🌬 CO₂: {item.co2}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #141e30, #243b55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    boxSizing: "border-box",
    color: "white",
    fontFamily: "sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "900px",
    background: "rgba(255,255,255,0.08)",
    padding: "30px",
    borderRadius: "15px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    justifyContent: "center",
    marginBottom: "25px",
    alignItems: "flex-end",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    fontSize: "14px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.3)",
    marginTop: "5px",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    outline: "none",
  },
  button: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#00c9a7",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    height: "40px",
  },
  results: {
    marginTop: "10px",
  },
  card: {
    background: "rgba(255,255,255,0.12)",
    padding: "12px 15px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  time: {
    fontSize: "13px",
    opacity: 0.8,
    marginBottom: "4px",
  },
  values: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    fontSize: "14px",
  },
};

export default SensorHistory;
