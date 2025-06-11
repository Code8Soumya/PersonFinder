const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { VertexAI } = require('@google-cloud/vertexai');

const client = new ImageAnnotatorClient();
const vertexai = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID,
    location: 'us-central1',
});

async function generateImageEmbedding(imageBuffer) {
    try {
        // First detect and crop the face using Vision API
        const [result] = await client.faceDetection(imageBuffer);
        const faces = result.faceAnnotations;
        
        if (!faces || faces.length === 0) {
            throw new Error('No face detected in the image');
        }

        // Use Vertex AI for generating embeddings
        const model = vertexai.preview.getModel('multimodal-model');
        const response = await model.predict({
            image: imageBuffer,
            parameters: {
                output_type: 'embedding',
                dimensionality: 512  // Adjust based on your needs
            }
        });

        return response.embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

module.exports = { generateImageEmbedding };
