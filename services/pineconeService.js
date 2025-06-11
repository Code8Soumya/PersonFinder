const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeIndex;

async function initPinecone() {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    return pineconeIndex;
}

async function upsertEmbedding(id, embedding, metadata) {
    if (!pineconeIndex) await initPinecone();
    
    return await pineconeIndex.upsert({
        vectors: [{
            id: id.toString(),
            values: embedding,
            metadata
        }]
    });
}

async function findSimilarFaces(embedding, topK = 5) {
    if (!pineconeIndex) await initPinecone();

    const queryResponse = await pineconeIndex.query({
        vector: embedding,
        topK,
        includeMetadata: true
    });

    return queryResponse.matches;
}

module.exports = {
    initPinecone,
    upsertEmbedding,
    findSimilarFaces
};
