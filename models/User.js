const db = require('../config/database');

class User {
    static async create({ user_name, email, gender, age }) {
        const [result] = await db.execute(
            'INSERT INTO user (user_name, email, gender, age) VALUES (?, ?, ?, ?)',
            [user_name, email, gender, age]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM user WHERE id = ?', [id]);
        return rows[0];
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM user');
        return rows;
    }
}

module.exports = User;