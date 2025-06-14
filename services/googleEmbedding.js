import "dotenv/config";
import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { helpers } from "@google-cloud/aiplatform";

const project = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_PROJECT_LOCATION;
const publisher = "google";
const model = "multimodalembedding@001";

// Initialize client
const clientOptions = {
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
};
const predictionServiceClient = new PredictionServiceClient(clientOptions);

// Generates an embedding for a given image using Google Vertex AI.
async function getImageEmbedding(imageBase64) {
    console.log("[googleEmbedding.js] Attempting to get image embedding...");
    try {
        const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

        const instance = helpers.toValue({
            image: {
                bytesBase64Encoded: imageBase64,
            },
        });

        const instances = [instance];
        const request = {
            endpoint,
            instances,
        };

        console.log(
            "[googleEmbedding.js] Sending request to Vertex AI Prediction API..."
        );
        const [response] = await predictionServiceClient.predict(request);
        console.log(
            "[googleEmbedding.js] Received response from Vertex AI Prediction API."
        );

        if (
            response &&
            response.predictions &&
            response.predictions.length > 0 &&
            response.predictions[0].structValue &&
            response.predictions[0].structValue.fields &&
            response.predictions[0].structValue.fields.imageEmbedding &&
            response.predictions[0].structValue.fields.imageEmbedding.listValue &&
            response.predictions[0].structValue.fields.imageEmbedding.listValue.values
        ) {
            console.log(
                "[googleEmbedding.js] Successfully extracted image embedding from response."
            );
            const imageEmbedding =
                response.predictions[0].structValue.fields.imageEmbedding.listValue.values.map(
                    (v) => v.numberValue
                );
            return imageEmbedding;
        } else {
            console.error(
                "[googleEmbedding.js] Error in getImageEmbedding: Embedding not found in the prediction response. Response:",
                JSON.stringify(response, null, 2)
            );
            throw new Error(
                "Embedding not found in the prediction response from Vertex AI."
            );
        }
    } catch (error) {
        console.error("[googleEmbedding.js] Error in getImageEmbedding:", error.message);
        throw error;
    }
}

export { getImageEmbedding };
