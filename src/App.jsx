import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import './styles.css';

const AcneSeverityPredictor = () => {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [_prediction, setPrediction] = useState(null); // Renamed to _prediction
  const [severityLevel, setSeverityLevel] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load the TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel('/models/65model.json');
        setModel(loadedModel);
        console.log('Model loaded successfully!');
      } catch (err) {
        console.error('Error loading model:', err);
      }
    };
    loadModel();
  }, []);

  // Handle image upload from gallery
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload image to backend
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('https://acne-ai-backend.onrender.com/, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Image uploaded:', response.data);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  // Handle camera scan
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageSrc = canvas.toDataURL('image/png');
    setImage(imageSrc);
  };

  // Predict acne severity
  const predictSeverity = async () => {
    if (!model || !image) return;

    const img = new Image();
    img.src = image;

    img.onload = async () => {
      const tensor = tf.browser
        .fromPixels(img)
        .resizeNearestNeighbor([224, 224]) // Adjust size based on your model's input
        .toFloat()
        .expandDims();

      const predictions = await model.predict(tensor);
      const severity = predictions.argMax(1).dataSync()[0]; // Get the predicted class
      setPrediction(predictions); // Set _prediction (intentionally unused)
      setSeverityLevel(severity);
      console.log('Predicted Severity Level:', severity);
    };
  };

  // Map severity level to text
  const getSeverityText = (level) => {
    switch (level) {
      case 0:
        return 'Extremely Mild';
      case 1:
        return 'Mild';
      case 2:
        return 'Moderate';
      case 3:
        return 'Severe';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="container">
      <h1>Acne Severity Predictor</h1>

      {/* Gallery Upload Section */}
      <div className="upload-section">
        <label htmlFor="upload">Upload an image from your gallery:</label>
        <input type="file" id="upload" accept="image/*" onChange={handleImageUpload} />
        <button className="upload-button" onClick={() => document.getElementById('upload').click()}>
          Choose File
        </button>
      </div>

      {/* Camera Scan Section */}
      <div className="camera-section">
        <label>Use your camera to scan acne:</label>
        <video ref={videoRef} autoPlay playsInline></video>
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={captureImage}>Capture Image</button>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>

      {/* Predict Button */}
      <button onClick={predictSeverity} disabled={!model || !image}>
        Predict Severity
      </button>

      {/* Prediction Result */}
      {severityLevel !== null && (
        <div className="prediction-result">
          <p>
            Predicted Acne Severity: <span className={`severity-level level-${severityLevel}`}>
              {getSeverityText(severityLevel)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AcneSeverityPredictor;
