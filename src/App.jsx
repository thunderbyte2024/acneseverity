import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const AcneSeverityPredictor = () => {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [severityLevel, setSeverityLevel] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ✅ Dynamically Load Model Based on Environment
  useEffect(() => {
    async function loadModel() {
      try {
        console.log("⏳ Loading model...");
        
        // Use local path if running locally, otherwise use the deployed URL
        const isLocal = window.location.hostname === "localhost";
        const modelUrl = isLocal 
          ? "/models/model.json" 
          : "https://acneseverity-deco.onrender.com/models/model.json";  
        
        const loadedModel = await tf.loadLayersModel(modelUrl);
        console.log("✅ Model loaded successfully!");
        
        setModel(loadedModel);
        loadedModel.summary(); // Debugging: Show model architecture
      } catch (error) {
        console.error("❌ Error loading model:", error);
      }
    }

    loadModel();
  }, []);

  // ✅ Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
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

  // ✅ Capture Image from Camera
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
    if (!model) {
      alert("⚠️ Model is not loaded yet. Please wait.");
      return;
    }
    
    if (!image) {
      alert("⚠️ Please upload or capture an image first.");
      return;
    }

    console.log("📸 Processing image...");
    
    const img = new Image();
    img.src = image;

    img.onload = async () => {
      try {
        // Convert image to TensorFlow format
        const tensor = tf.browser
          .fromPixels(img)
          .resizeBilinear([224, 224])  // ✅ Better resizing method
          .toFloat()
          .div(tf.scalar(255))  // ✅ Normalize pixel values
          .expandDims();  // Add batch dimension

        console.log("🧠 Running prediction...");
        const predictions = model.predict(tensor);
        const data = await predictions.data(); // ✅ Await for correct output
        const severity = data.indexOf(Math.max(...data));

        setSeverityLevel(severity);
        console.log("✅ Predicted Severity Level:", severity);
      } catch (error) {
        console.error("❌ Error during prediction:", error);
      }
    };
  };

  return (
    <div className="container">
      <h1>Acne Severity Detector</h1>

      {/* Upload Section */}
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
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
