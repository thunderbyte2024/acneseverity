import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import './styles.css';

const AcneSeverityPredictor = () => {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [severityLevel, setSeverityLevel] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ✅ Load Model from Backend
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("⏳ Loading model from backend...");
        const modelUrl = 'https://acne-ai-backend.onrender.com/models/65model.json';
        const loadedModel = await tf.loadLayersModel(modelUrl);
        setModel(loadedModel);
        console.log("✅ Model loaded successfully!");
      } catch (err) {
        console.error("❌ Error loading model:", err);
      }
    };
    loadModel();
  }, []);

  // ✅ Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload image to backend
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(
        'https://acne-ai-backend.onrender.com/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log("✅ Image uploaded:", response.data);
    } catch (err) {
      console.error("❌ Error uploading image:", err);
    }
  };

  // ✅ Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("❌ Error accessing camera:", err);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL('image/png'));
    }
  };

  // ✅ Predict Acne Severity
  const predictSeverity = async () => {
    if (!model || !image) {
      alert("⚠️ Please upload an image or capture one first.");
      return;
    }

    const img = new Image();
    img.src = image;

    img.onload = async () => {
      try {
        const tensor = tf.browser
          .fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .div(tf.scalar(255))
          .expandDims();

        const predictions = model.predict(tensor);
        const data = await predictions.data();
        const severity = data.indexOf(Math.max(...data));

        setPrediction(data);
        setSeverityLevel(severity);
        console.log("✅ Predicted Severity Level:", severity);
      } catch (error) {
        console.error("❌ Error during prediction:", error);
      }
    };
  };

  return (
    <div className="container">
      <h1>Acne Severity Predictor</h1>

      {/* Upload Section */}
      <div className="upload-section">
        <label htmlFor="upload">Upload an image:</label>
        <input type="file" id="upload" accept="image/*" onChange={handleImageUpload} />
      </div>

      {/* Camera Section */}
      <div className="camera-section">
        <video ref={videoRef} autoPlay playsInline></video>
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={captureImage}>Capture Image</button>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>

      {/* Predict Button */}
      <button onClick={predictSeverity} disabled={!model}>
        Predict Severity
      </button>

      {/* Prediction Result */}
      {severityLevel !== null && (
        <div className="prediction-result">
          <p>Predicted Acne Severity: <strong>{['Extremely Mild', 'Mild', 'Moderate', 'Severe'][severityLevel]}</strong></p>
        </div>
      )}
    </div>
  );
};

export default AcneSeverityPredictor;
