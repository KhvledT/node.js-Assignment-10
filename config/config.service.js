import dotenv from 'dotenv';
import path from 'path';

export const NODE_ENV = process.env.NODE_ENV || 'dev';

const envPath = {
    dev: path.resolve("./config/.env.dev"),
    prod: path.resolve("./config/.env.prod")
}

dotenv.config({ path: envPath[NODE_ENV] || envPath.dev })

export const DB_ATLAS = process.env.DB_ATLAS;
export const SALT_ROUNDS = +process.env.SALT_ROUNDS;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const JWT_SECRET_ACCESS_USER = process.env.JWT_SECRET_ACCESS_USER;
export const JWT_SECRET_ACCESS_ADMIN = process.env.JWT_SECRET_ACCESS_ADMIN;
export const JWT_SECRET_REFRESH_USER = process.env.JWT_SECRET_REFRESH_USER;
export const JWT_SECRET_REFRESH_ADMIN = process.env.JWT_SECRET_REFRESH_ADMIN;
export const NODEMAILER_USER = process.env.NODEMAILER_USER
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID
export const REDIS_URL = process.env.REDIS_URL