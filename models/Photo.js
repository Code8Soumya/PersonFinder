const db = require('../config/database');

class Photo {
    static async create({ user_id, photoBuffer }) {
        const [result] = await db.execute(
            'INSERT INTO photo (user_id, photo_data) VALUES (?, ?)',
            [user_id, photoBuffer]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM photo WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByUserId(user_id) {
        const [rows] = await db.execute('SELECT * FROM photo WHERE user_id = ?', [user_id]);
        return rows;
    }

    static async getPhotoData(id) {
        const [rows] = await db.execute('SELECT photo_data FROM photo WHERE id = ?', [id]);
        return rows[0]?.photo_data;
    }
}

module.exports = Photo;