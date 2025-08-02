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

    console.log("AI Detection Response:", response.data);
    
    // Filter for items with high confidence (any object, not just food)
    const detectedItems = response.data
      .filter(item => item.score > 0.5) // Only keep predictions with >50% confidence
      .sort((a, b) => b.score - a.score); // Sort by confidence, highest first

    // Return the highest confidence item or fallback
    if (detectedItems.length > 0) {
      return detectedItems[0].label;
    } else {
      // If no high-confidence items, return the best available or fallback
      const highestConfidence = response.data
        .sort((a, b) => b.score - a.score)[0];
      
      return highestConfidence ? highestConfidence.label : 'Item';
    }
    
  } catch (error) {
    console.error('Error detecting item:', error);
    
    // If API fails, return a generic name
    return 'Item';
  }
};
