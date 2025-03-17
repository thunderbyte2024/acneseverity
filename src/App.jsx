//import React, { useEffect, useState, useRef } from 'react';
//import * as tf from '@tensorflow/tfjs';
import * as tf from "@tensorflow/tfjs";
import { useEffect, useState } from "react";

const AcneSeverityPredictor = () => {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [severityLevel, setSeverityLevel] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  /*  ✅ Load Model from /public folder
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("⏳ Loading model...");
        const modelUrl = '/models/model.json'; // Load locally from public folder
        const loadedModel = await tf.loadLayersModel(modelUrl);
        setModel(loadedModel);
        console.log("✅ Model loaded successfully!");
      } catch (err) {
        console.error("❌ Error loading model:", err);
      }
    };
    loadModel();
  }, []);*/



const App = () => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    async function loadModel() {
      try {
        let loadedModel = await tf.loadLayersModel("/models/model.json");

        // Manually define input shape
        const inputLayer = tf.input({ shape: [224, 224, 3] });
        const outputLayer = loadedModel.apply(inputLayer);
        loadedModel = tf.model({ inputs: inputLayer, outputs: outputLayer });

        console.log("✅ Model loaded successfully!");
        setModel(loadedModel);
      } catch (error) {
        console.error("❌ Error loading model:", error);
      }
    }

    loadModel();
  }, []);

  return <div>Acne Severity Detector</div>;
};

export default App;


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
          .div(tf.scalar(255)) // ✅ Normalization fix
          .expandDims();

        const predictions = model.predict(tensor);
        const data = await predictions.data();
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
