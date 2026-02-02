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

  const [errors, setErrors] = useState({});
  const [ucs, setUcs] = useState(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Handle input changes
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = value === "" ? "" : parseFloat(value);
    let newInputs = { ...inputs, [name]: val };
    let newErrors = { ...errors };

    // Auto-calculate PI if LL or PL changes
    if (name === "LL" || name === "PL") {
      if (newInputs.LL !== "" && newInputs.PL !== "") {
        newInputs.PI = newInputs.LL - newInputs.PL;
      } else {
        newInputs.PI = "";
      }
    }

    // Validate Clay + Silt
    if (name === "Clay_Content" || name === "Silt_Content") {
      if (newInputs.Clay_Content !== "" && newInputs.Silt_Content !== "") {
        const sum = newInputs.Clay_Content + newInputs.Silt_Content;
        if (sum < 50 || sum > 100) {
          newErrors.Clay_Silt = "Clay + Silt must be >50 and <=100";
        } else {
          delete newErrors.Clay_Silt;
        }
      }
    }

    // Validate Mixing
    if (name === "Mixing") {
      if (val > 12) {
        newErrors.Mixing = "Mixing cannot be more than 12%";
      } else {
        delete newErrors.Mixing;
      }
    }

    setInputs(newInputs);
    setErrors(newErrors);
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
    setErrors({});
    setUcs(null);
  };

  // -----------------------------
  // Predict UCS
  // -----------------------------
  const predictUCS = async () => {
    // Validation: all inputs must be filled
    for (let key in inputs) {
      if (inputs[key] === "" && key !== "PI") {
        alert(`Please enter a value for ${key}`);
        return;
      }
    }

    // Check constraints
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join("\n"));
      return;
    }

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
              readOnly={key === "PI"} // PI auto-calculated
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "16px",
                borderRadius: "5px",
                border:
                  (key === "Clay_Content" || key === "Silt_Content") &&
                  errors.Clay_Silt
                    ? "2px solid red"
                    : key === "Mixing" && errors.Mixing
                    ? "2px solid red"
                    : "1px solid #ccc",
              }}
            />
          </div>
        ))}
      </div>

      {/* Show error messages */}
      {Object.keys(errors).map((err) => (
        <p key={err} style={{ color: "red", marginTop: "10px" }}>
          {errors[err]}
        </p>
      ))}

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
