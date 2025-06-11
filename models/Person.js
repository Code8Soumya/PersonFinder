const db = require('../config/database');
const { Pinecone } = require('@pinecone-database/pinecone');

class Person {
    static async create(personData) {
        const { name, photo_path, vector_embedding, ...otherData } = personData;
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Insert into MySQL
            const [result] = await connection.execute(
                'INSERT INTO persons (name, photo_path, additional_data) VALUES (?, ?, ?)',
                [name, photo_path, JSON.stringify(otherData)]
            );
            
            // Insert into Pinecone
            const pinecone = new Pinecone();
            await pinecone.init({
                environment: process.env.PINECONE_ENVIRONMENT,
                apiKey: process.env.PINECONE_API_KEY
            });
            
            const index = pinecone.Index(process.env.PINECONE_INDEX);
            await index.upsert({
                vectors: [{
                    id: result.insertId.toString(),
                    values: vector_embedding,
                    metadata: { name, photo_path }
                }]
            });
            
            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findByPhoto(vector_embedding) {
        const pinecone = new PineconeClient();
        await pinecone.init({
            environment: process.env.PINECONE_ENVIRONMENT,
            apiKey: process.env.PINECONE_API_KEY
        });
        
        const index = pinecone.Index(process.env.PINECONE_INDEX);
        const queryResponse = await index.query({
            vector: vector_embedding,
            topK: 5,
            includeMetadata: true
        });
        
        if (queryResponse.matches.length === 0) {
            return null;
        }
        
        // Get full person data from MySQL
        const personIds = queryResponse.matches.map(match => match.id);
        const [persons] = await db.execute(
            'SELECT * FROM persons WHERE id IN (?)',
            [personIds]
        );
        
        return persons;
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM persons');
        return rows;
    }
}

module.exports = Person; 