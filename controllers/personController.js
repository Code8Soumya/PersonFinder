import { Photo } from "../models/photo.js";
import { Person } from "../models/person.js";
import { getImageEmbedding } from "../services/googleEmbedding.js";
import { upsertEmbedding, findPhotoId } from "../services/pineconeService.js";

// Adds a new person and their photos to the database.
export async function addPerson(req, res) {
    console.log("[personController.js] addPerson: Initiating request");
    try {
        const { name, email, gender, age } = req.body;
        console.log("[personController.js] addPerson: Request body parsed");

        if (!req.files || req.files.length === 0) {
            console.log(
                "[personController.js] addPerson: Validation failed - no photos uploaded"
            );
            return res.status(400).json({ error: "No photos uploaded" });
        }
        console.log("[personController.js] addPerson: Photo presence validated");

        console.log(
            "[personController.js] addPerson: Attempting to create person in database"
        );
        const personId = await Person.createPerson(name, email, gender, age);
        console.log(
            `[personController.js] addPerson: Person created with ID ${personId}`
        );

        console.log("[personController.js] addPerson: Starting photo processing loop");
        for (const file of req.files) {
            console.log("[personController.js] addPerson: Processing a photo");
            try {
                console.log(
                    "[personController.js] addPerson: Attempting to save photo to database"
                );
                const photoId = await Photo.addPhoto({
                    person_id: personId,
                    photoBytes: file.buffer,
                });
                console.log(
                    `[personController.js] addPerson: Photo saved with ID ${photoId}`
                );

                console.log(
                    "[personController.js] addPerson: Attempting to generate image embedding"
                );
                const imageBase64 = file.buffer.toString("base64");
                const embedding = await getImageEmbedding(imageBase64);
                console.log("[personController.js] addPerson: Image embedding generated");

                console.log(
                    "[personController.js] addPerson: Attempting to upsert embedding to Pinecone"
                );
                await upsertEmbedding(photoId, embedding);
                console.log(
                    "[personController.js] addPerson: Embedding upserted to Pinecone"
                );

                console.log(
                    "[personController.js] addPerson: Individual photo processing complete"
                );
            } catch (photoError) {
                console.error(
                    "[personController.js] Error in addPerson (photo processing):",
                    photoError.message
                );
            }
        }
        console.log("[personController.js] addPerson: Photo processing loop finished");

        console.log(
            "[personController.js] addPerson: Successfully added person and photos"
        );
        res.status(201).json({
            message: "Person and photos added successfully",
        });
    } catch (error) {
        console.error("[personController.js] Error in addPerson:", error.message);
        res.status(500).json({
            error: "An unexpected error occurred while adding the person.",
        });
    }
}

// Finds a person based on an uploaded photo by comparing embeddings.
export async function findPerson(req, res) {
    console.log("[personController.js] findPerson: Initiating request");
    try {
        if (!req.files || req.files.length === 0) {
            console.log(
                "[personController.js] findPerson: Validation failed - no photo uploaded for search"
            );
            return res.status(400).json({ error: "No photo uploaded" });
        }
        console.log("[personController.js] findPerson: Photo presence validated");

        console.log(
            "[personController.js] findPerson: Attempting to generate embedding for uploaded photo"
        );
        const imageBase64 = req.files[0].buffer.toString("base64");
        const embedding = await getImageEmbedding(imageBase64);
        console.log(
            "[personController.js] findPerson: Embedding generated for uploaded photo"
        );

        console.log(
            "[personController.js] findPerson: Attempting to find similar faces in Pinecone"
        );
        const matches = await findPhotoId(embedding, 1);
        console.log(
            `[personController.js] findPerson: Pinecone search completed, found ${
                matches ? matches.length : 0
            } potential matches`
        );

        if (!matches || matches.length === 0) {
            console.log(
                "[personController.js] findPerson: No matching faces found in Pinecone"
            );
            return res.status(404).json({ error: "No matching faces found" });
        }

        console.log(
            "[personController.js] findPerson: Processing matched photos to retrieve person details"
        );
        const resultsData = [];

        for (const match of matches) {
            console.log(
                `[personController.js] findPerson: Processing match with ID ${match.id} and score ${match.score}`
            );
            const photoId = match.id;
            let photo;
            try {
                console.log(
                    `[personController.js] findPerson: Attempting to retrieve photo details for ID ${photoId} from database`
                );
                photo = await Photo.findById(photoId);
                if (!photo) {
                    console.log(
                        `[personController.js] findPerson: Photo details not found in database for ID ${photoId}`
                    );
                    continue;
                }
                console.log(
                    `[personController.js] findPerson: Photo details retrieved for ID ${photoId}`
                );
            } catch (dbError) {
                console.error(
                    `[personController.js] Error in findPerson (retrieving photo ${photoId}):`,
                    dbError.message
                );
                continue;
            }

            if (!photo.photo_data || photo.photo_data.length === 0) {
                console.log(
                    `[personController.js] findPerson: Photo data (BLOB) is missing or empty for photo ID ${photoId}`
                );
                continue;
            }
            console.log(
                `[personController.js] findPerson: Photo data validated for photo ID ${photoId}`
            );

            let personDataArray;
            try {
                console.log(
                    `[personController.js] findPerson: Attempting to retrieve person data for person_id ${photo.person_id} from database`
                );
                personDataArray = await Person.getPersonById(photo.person_id);
                if (!personDataArray || personDataArray.length === 0) {
                    console.log(
                        `[personController.js] findPerson: Person data not found for person_id ${photo.person_id}`
                    );
                    continue;
                }
                console.log(
                    `[personController.js] findPerson: Person data retrieved for person_id ${photo.person_id}`
                );
            } catch (dbError) {
                console.error(
                    `[personController.js] Error in findPerson (retrieving person ${photo.person_id}):`,
                    dbError.message
                );
                continue;
            }

            const person = personDataArray[0];
            console.log(
                "[personController.js] findPerson: Person details processed for a match"
            );
            resultsData.push({
                photoId: photo.id,
                photoData: photo.photo_data.toString("base64"),
                person: person,
                similarity: match.score,
            });
            console.log("[personController.js] findPerson: Match added to results");
        }
        console.log(
            "[personController.js] findPerson: Matched photos processing loop finished"
        );

        if (resultsData.length === 0) {
            console.log(
                "[personController.js] findPerson: No valid person details found for any matching faces after database lookups"
            );
            return res
                .status(404)
                .json({ error: "Person details for matching faces not found." });
        }

        console.log(
            "[personController.js] findPerson: Successfully found matching faces and person details"
        );
        res.json({
            message: "Matching faces found",
            results: resultsData,
        });
    } catch (error) {
        console.error("[personController.js] Error in findPerson:", error.message);
        res.status(500).json({
            error: "An unexpected error occurred while finding the person.",
        });
    }
}
