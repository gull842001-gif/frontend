
import React, { useState } from "react";

function App() {
  // -----------------------------
  // Input state for all features
  // -----------------------------
  const [inputs, setInputs] = useState({
    Clay_Content: "",
    Silt_Content: "",
    LL: "",
    PL: "",
    PI: "",
    SiO2: "",
    Al2O3: "",
    Fe2O3: "",
    MgO: "",
    CaO: "",
    CaO_lime: "",
    Mixing: "",
    Curing_Days: "",
    Water_Content: "",
  });

  const [ucs, setUcs] = useState(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // -----------------------------
  // Reset inputs & result
  // -----------------------------
  const handleReset = () => {
    setInputs({
      Clay_Content: "",
      Silt_Content: "",
      LL: "",
      PL: "",
      PI: "",
      SiO2: "",
      Al2O3: "",
      Fe2O3: "",
      MgO: "",
      CaO: "",
      CaO_lime: "",
      Mixing: "",
      Curing_Days: "",
      Water_Content: "",
    });
    setUcs(null);
  };

  // -----------------------------
  // Predict UCS
  // -----------------------------
  const predictUCS = async () => {
    // Validation
    for (let key in inputs) {
      if (inputs[key] === "") {
        alert(`Please enter a value for ${key}`);
        return;
      }
    }

    setLoading(true);

    try {
      // -----------------------------
      // Replace this with your ngrok URL
      // -----------------------------
      const NGROK_URL = "https://ucs-backend-production.up.railway.app/predict";



      const response = await fetch(NGROK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(inputs).map(([k, v]) => [k, parseFloat(v)])
          )
        ),
      });

      const data = await response.json();

      if (data.ucs !== undefined) {
        setUcs(data.ucs);
      } else if (data.error) {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Backend not running or unreachable!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        UCS Prediction System
      </h2>

      <div
        style={{
          display: "grid",
          gap: "15px",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {Object.keys(inputs).map((key) => (
          <div key={key}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              {key}:
            </label>
            <input
              type="number"
              name={key}
              value={inputs[key]}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
        <button
          onClick={predictUCS}
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 0",
            fontSize: "18px",
            cursor: "pointer",
            borderRadius: "5px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "Predicting..." : "Predict UCS"}
        </button>

        <button
          onClick={handleReset}
          style={{
            flex: 1,
            padding: "12px 0",
            fontSize: "18px",
            cursor: "pointer",
            borderRadius: "5px",
            backgroundColor: "#6c757d",
            color: "#fff",
            border: "none",
          }}
        >
          Reset
        </button>
      </div>

      {ucs !== null && (
        <h3
          style={{
            marginTop: "25px",
            textAlign: "center",
            color: "#28a745",
          }}
        >
          Predicted UCS: {ucs} MPa
        </h3>
      )}
    </div>
  );
}

export default App;
