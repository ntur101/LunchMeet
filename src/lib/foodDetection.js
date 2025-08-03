import axios from "axios";

// Converts blob to base64 (after canvas.toBlob or file input)
const blobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

export const detectFood = async (blob) => {
  try {
    const base64Image = await blobToBase64(blob);
    
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/detr-resnet-50",
      {
        inputs: base64Image
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("AI Detection Response (full):", response.data);
    
    // Check if the model is still loading
    if (response.data.error && response.data.error.includes('loading')) {
      console.log("Model is still loading, will retry...");
      return 'Item (Model Loading)';
    }
    
    // Sort all detections by confidence first to see what we're getting
    const allDetections = response.data
      .sort((a, b) => b.score - a.score);
    
    console.log("All detections sorted by confidence:", allDetections);
    
    // Lower confidence threshold to 0.3 to see more results
    const detectedItems = response.data
      .filter(item => item.score > 0.3) // Lowered from 0.5 to 0.3
      .sort((a, b) => b.score - a.score);

    console.log("High confidence detections (>0.3):", detectedItems);

    // Return the highest confidence item or fallback
    if (detectedItems.length > 0) {
      const bestDetection = detectedItems[0];
      console.log(`Returning: ${bestDetection.label} (confidence: ${bestDetection.score.toFixed(3)})`);
      return bestDetection.label;
    } else {
      // If no high-confidence items, return the best available or fallback
      const highestConfidence = response.data
        .sort((a, b) => b.score - a.score)[0];
      
      if (highestConfidence) {
        console.log(`Fallback detection: ${highestConfidence.label} (confidence: ${highestConfidence.score.toFixed(3)})`);
        return highestConfidence.label;
      } else {
        console.log("No detections found, using fallback");
        return 'Item';
      }
    }
    
  } catch (error) {
    console.error('Error detecting item:', error);
    
    // If the main model fails, try a backup approach
    if (error.response) {
      console.log('API Error Response:', error.response.data);
      
      // If it's a model loading error, indicate that
      if (error.response.data?.error?.includes('loading')) {
        return 'Item (Model Loading)';
      }
    }
    
    // If API fails completely, return a generic name
    return 'Item';
  }
};
