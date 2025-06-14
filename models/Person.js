import { db } from "../config/database.js";

class Person {
    // Creates a new person record in the database.
    static async createPerson(name, email, gender, age) {
        let connection;
        console.log("[person.js] Attempting to create person");
        try {
            connection = await db.getConnection();
            console.log("[person.js] Database connection obtained for createPerson");
            await connection.beginTransaction();
            console.log("[person.js] Transaction started for createPerson");
            const [result] = await connection.execute(
                "INSERT INTO person (name, email, gender, age) VALUES (?, ?, ?, ?)",
                [name, email, gender, age]
            );
            console.log("[person.js] Person inserted into database");
            await connection.commit();
            console.log("[person.js] Transaction committed for createPerson");
            return result.insertId;
        } catch (error) {
            console.error("[person.js] Error in createPerson:", error.message);
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    // Retrieves a person from the database by their ID.
    static async getPersonById(personId) {
        let connection;
        console.log("[person.js] Attempting to get person by ID");
        try {
            connection = await db.getConnection();
            console.log("[person.js] Database connection obtained for getPersonById");
            const [persons] = await connection.execute(
                "SELECT * FROM person WHERE id = ?",
                [personId]
            );
            console.log("[person.js] Person data fetched for getPersonById");
            return persons;
        } catch (error) {
            console.error("[person.js] Error in getPersonById:", error.message);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

export { Person };
