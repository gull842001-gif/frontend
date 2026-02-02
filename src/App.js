import React, { useState, useEffect } from "react";

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
  // Validation errors
  // -----------------------------
  const [errors, setErrors] = useState({
    claySilt: "",
    mixing: "",
  });

  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------
  // Auto-calculate PI
  // -----------------------------
  useEffect(() => {
    const ll = parseFloat(inputs.LL);
    const pl = parseFloat(inputs.PL);
    if (!isNaN(ll) && !isNaN(pl)) {
      setInputs((prev) => ({ ...prev, PI: ll - pl }));
    } else {
      setInputs((prev) => ({ ...prev, PI: "" }));
    }
  }, [inputs.LL, inputs.PL]);

  // -----------------------------
  // Constraint validation
  // -----------------------------
  const validateConstraints = () => {
    const clay = parseFloat(inputs.Clay_Content);
    const silt = parseFloat(inputs.Silt_Content);
    const mixing = parseFloat(inputs.Mixing);

    let valid = true;
    let newErrors = { claySilt: "", mixing: "" };

    if (isNaN(clay) || isNaN(silt) || clay + silt <= 50 || clay + silt > 100) {
      newErrors.claySilt = "Clay + Silt must be >50 and <=100";
      valid = false;
    }

    if (!isNaN(mixing) && mixing > 12) {
      newErrors.mixing = "Mixing cannot be more than 12%";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // -----------------------------
  // Predict UCS
  // -----------------------------
  const predictUCS = async () => {
    // Basic input validation
    for (let key in inputs) {
      if (inputs[key] === "") {
        alert(`Please enter a value for ${key}`);
        return;
      }
    }

    if (!validateConstraints()) return;

    setLoading(true);

    try {
      const NGROK_URL =
        "https://247b140a-78a5-40ca-aeb5-107005428cbc-00-1gqdyd4psx6zz.sisko.replit.dev/predict";

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
    setErrors({ claySilt: "", mixing: "" });
    setUcs(null);
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
              disabled={key === "PI"} // PI auto-calculated
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            {/* Show error messages */}
            {key === "Clay_Content" || key === "Silt_Content" ? (
              <div style={{ color: "red", fontSize: "12px" }}>{errors.claySilt}</div>
            ) : null}
            {key === "Mixing" ? (
              <div style={{ color: "red", fontSize: "12px" }}>{errors.mixing}</div>
            ) : null}
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
