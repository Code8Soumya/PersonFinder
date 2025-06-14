import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

let pineconeIndex;

// Initializes the Pinecone client and index.
async function initPinecone() {
    console.log("[pineconeService.js] Attempting to initialize Pinecone...");
    try {
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);
        console.log("[pineconeService.js] Pinecone initialized successfully.");
        return pineconeIndex;
    } catch (error) {
        console.error("[pineconeService.js] Error in initPinecone:", error.message);
        throw new Error(`Failed to initialize Pinecone: ${error.message}`);
    }
}

// Upserts a photo embedding into the Pinecone index.
async function upsertEmbedding(photoId, embedding) {
    console.log(
        `[pineconeService.js] Attempting to upsert embedding for photoId: ${photoId}`
    );
    try {
        if (!pineconeIndex) {
            console.log(
                "[pineconeService.js] Pinecone not initialized. Initializing now..."
            );
            await initPinecone();
        }
        const record = [
            {
                id: photoId.toString(),
                values: embedding,
            },
        ];
        console.log("[pineconeService.js] Sending upsert request to Pinecone...");
        const upsertResult = await pineconeIndex.upsert(record);
        console.log("[pineconeService.js] Embedding upserted successfully.");
        return upsertResult;
    } catch (error) {
        console.error("[pineconeService.js] Error in upsertEmbedding:", error.message);
        throw new Error(`Failed to upsert embedding: ${error.message}`);
    }
}

// Finds similar photo IDs in Pinecone based on an embedding.
async function findPhotoId(embedding, topK) {
    console.log("[pineconeService.js] Attempting to find similar photo IDs...");
    try {
        if (!pineconeIndex) {
            console.log(
                "[pineconeService.js] Pinecone not initialized. Initializing now..."
            );
            await initPinecone();
        }
        console.log("[pineconeService.js] Sending query request to Pinecone...");
        const queryResponse = await pineconeIndex.query({
            vector: embedding,
            topK,
            includeValues: false,
            includeMetadata: false,
        });

        if (queryResponse && queryResponse.matches && queryResponse.matches.length > 0) {
            console.log(
                `[pineconeService.js] Found ${queryResponse.matches.length} matches.`
            );
            return queryResponse.matches;
        } else {
            console.log(
                "[pineconeService.js] No matches found or empty response from Pinecone."
            );
            return [];
        }
    } catch (error) {
        console.error("[pineconeService.js] Error in findPhotoId:", error.message);
        return [];
    }
}

export { upsertEmbedding, findPhotoId };
