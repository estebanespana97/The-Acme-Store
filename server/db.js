const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_store');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const createTables = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS favorite;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS product;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
    CREATE TABLE product(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );
    CREATE TABLE favorite(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      product_id  UUID REFERENCES product(id) NOT NULL,
      CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id)
    );
  `;
  await client.query(SQL);

};

const createUser = async({ username, password })=> {
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [ uuid.v4(), username, await bcrypt.hash(password, 5)]);
  return response.rows[0];
};

const createProduct = async({ name })=> {
  const SQL = `
    INSERT INTO product(id, name) VALUES ($1, $2) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), name]);
  return response.rows[0];
};

const createFavorite = async({ user_id, product_id })=> {
  const SQL = `
    INSERT INTO favorite(id, user_id, product_id) VALUES ($1, $2, $3) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

const fetchUsers = async()=> {
  const SQL = `
    SELECT id, username 
    FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async()=> {
  const SQL = `
    SELECT *
    FROM product
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchFavorites = async(user_id)=> {
  const SQL = `
    SELECT *
    FROM favorite
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [ user_id ]);
  return response.rows;
};

const destroyFavorite = async({user_id, id})=> {
  const SQL = `
    DELETE
    FROM favorite
    WHERE user_id = $1 AND id = $2
  `;
  await client.query(SQL, [ user_id, id ]);
};

module.exports = {
  client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite
};         