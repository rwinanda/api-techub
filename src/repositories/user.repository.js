export const checkEmailExist = async (email, client) => {
    const query = 'SELECT email FROM users WHERE email = $1';
    const result = await client.query(query, [email]);

    return result.rows;
}

export const getUserByEmail = async (email, client) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [email]);

    return result.rows;
}

export const getUserById = async (userId, client) => {
    const query = 'SELECT * FROM users WHERE id_user = $1';
    const result =  await client.query(query, [userId]);

    return result.rows || null;
}

export const insertUser = async (data, client, hashedPassword) => {
    const userQuery = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *'
    
    const result = await client.query(userQuery, [data.name, data.email, hashedPassword, data.role]);
    return result.rows[0];
}