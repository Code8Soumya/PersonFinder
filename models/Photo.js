import { db } from "../config/database.js";

class Photo {
    // Adds a new photo record to the database.
    static async addPhoto({ person_id, photoBytes }) {
        let connection;
        console.log("[photo.js] Attempting to add photo");
        try {
            connection = await db.getConnection();
            console.log("[photo.js] Database connection obtained for addPhoto");
            await connection.beginTransaction();
            console.log("[photo.js] Transaction started for addPhoto");
            const [result] = await connection.execute(
                "INSERT INTO photo (person_id, photo_data) VALUES (?, ?)",
                [person_id, photoBytes]
            );
            console.log("[photo.js] Photo inserted into database");
            await connection.commit();
            console.log("[photo.js] Transaction committed for addPhoto");
            return result.insertId;
        } catch (error) {
            console.error("[photo.js] Error in addPhoto:", error.message);
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    // Retrieves the person_id associated with a given photo_id.
    static async getPersonId(photo_id) {
        let connection;
        console.log("[photo.js] Attempting to get person_id by photo_id");
        try {
            connection = await db.getConnection();
            console.log("[photo.js] Database connection obtained for getPersonId");
            const [rows] = await connection.execute(
                "SELECT person_id FROM photo WHERE id = ?",
                [photo_id]
            );
            console.log("[photo.js] person_id fetched for getPersonId");
            return rows[0]?.person_id;
        } catch (error) {
            console.error("[photo.js] Error in getPersonId:", error.message);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    // Retrieves the photo_data for a given photo_id.
    static async getPhotoData(photo_id) {
        let connection;
        console.log("[photo.js] Attempting to get photo_data by photo_id");
        try {
            connection = await db.getConnection();
            console.log("[photo.js] Database connection obtained for getPhotoData");
            const [rows] = await connection.execute(
                "SELECT photo_data FROM photo WHERE id = ?",
                [photo_id]
            );
            console.log("[photo.js] photo_data fetched for getPhotoData");
            return rows[0]?.photo_data;
        } catch (error) {
            console.error("[photo.js] Error in getPhotoData:", error.message);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    // Finds a photo by its ID.
    static async findById(id) {
        let connection;
        console.log("[photo.js] Attempting to find photo by ID");
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            console.error(
                `[photo.js] Error in findById: Invalid ID provided (not a number): ${id}`
            );
            return null;
        }
        try {
            connection = await db.getConnection();
            console.log("[photo.js] Database connection obtained for findById");
            console.log(`[photo.js] Querying database for photo with id: ${numericId}`);
            const [rows] = await connection.execute(
                "SELECT id, person_id, photo_data FROM photo WHERE id = ?",
                [numericId]
            );
            console.log(`[photo.js] Photo data fetched for findById (id: ${numericId})`);
            if (rows.length > 0) {
                return rows[0];
            }
            console.log(`[photo.js] No photo found with id: ${numericId}`);
            return null;
        } catch (error) {
            console.error("[photo.js] Error in findById:", error.message);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

export { Photo };
