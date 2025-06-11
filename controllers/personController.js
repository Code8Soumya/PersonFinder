const User = require('../models/User');
const Photo = require('../models/Photo');
const multer = require('multer');
const { generateImageEmbedding } = require('../services/googleEmbedding');
const { upsertEmbedding, findSimilarFaces } = require('../services/pineconeService');

// Configure multer for memory storage (for BLOB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('photos', 10);

exports.addPerson = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        try {
            const { user_name, email, gender, age } = req.body;
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No photos uploaded' });
            }

            // 1. Create user
            const userId = await User.create({ user_name, email, gender, age });

            // 2. Process each photo
            for (const file of req.files) {
                try {
                    // Save photo as BLOB
                    const photoId = await Photo.create({ 
                        user_id: userId, 
                        photoBuffer: file.buffer 
                    });

                    // Generate embedding using Google API
                    const embedding = await generateImageEmbedding(file.buffer);

                    // Store embedding in Pinecone
                    await upsertEmbedding(photoId, embedding, {
                        user_id: userId,
                        photo_id: photoId
                    });
                } catch (photoError) {
                    console.error('Error processing photo:', photoError);
                    // Continue with other photos if one fails
                }
            }

            res.status(201).json({ 
                user_id: userId, 
                message: 'User and photos added successfully' 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

exports.findPerson = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No photo uploaded' });
            }

            // Generate embedding for the uploaded photo
            const embedding = await generateImageEmbedding(req.files[0].buffer);

            // Search for similar faces in Pinecone
            const matches = await findSimilarFaces(embedding);
            
            if (!matches || matches.length === 0) {
                return res.status(404).json({ error: 'No matching faces found' });
            }

            // Get user details for the top match
            const topMatch = matches[0];
            const user = await User.findById(topMatch.metadata.user_id);

            res.json({
                user,
                similarity: topMatch.score,
                matches: matches.slice(0, 3) // Return top 3 matches
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};