import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "./styles.css";

const App = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading model...");
        const loadedModel = await tf.loadLayersModel(window.location.origin + "/models/65model.json");
 // Ensure correct path
        setModel(loadedModel);
        setLoading(false);
        console.log("✅ Model Loaded Successfully");
      } catch (error) {
        console.error("❌ Error loading model:", error);
        alert("Failed to load model. Check console for details.");
        setLoading(false);
      }
    };
    loadModel();
  }, []);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preprocess Image for Model
  const preprocessImage = async (imgElement) => {
    return tf.browser
      .fromPixels(imgElement)
      .resizeNearestNeighbor([224, 224]) // Ensure this matches your model's input size
      .toFloat()
      .div(tf.scalar(255))
      .expandDims();
  };

  // Analyze image
  const analyzeImage = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }
    if (!model) {
      alert("Model is still loading. Please wait.");
      return;
    }

    try {
      const imgElement = document.getElementById("uploadedImage");
      const tensor = await preprocessImage(imgElement);

      // Make prediction
      const predictionTensor = model.predict(tensor);
      const result = await predictionTensor.data();
      setPrediction(result[0]); // Adjust based on model output

      console.log("✅ Prediction:", result);
    } catch (error) {
      console.error("❌ Error during prediction:", error);
      alert("Error during analysis. Check console for details.");
    }
  };

  return (
    <div className="container">
      <h1>Acne Severity AI</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} />
      
      {loading && <p>Loading model... Please wait.</p>}
      
      {image && (
        <div className="image-container">
          <img id="uploadedImage" src={image} alt="Uploaded Preview" />
        </div>
      )}

      <button onClick={analyzeImage} className="analyze-button" disabled={loading}>
        {loading ? "Loading..." : "Analyze"}
      </button>

      {prediction !== null && (
        <div className="result">
          <h2>Prediction: {prediction.toFixed(2)}</h2>
        </div>
      )}
    </div>
  );
};

export default App;
