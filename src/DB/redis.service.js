import { client } from "./redis.connection.js";

export async function set({ key, value, exType = "EX", exValue = 60 }) {
  return await client.set(key, value, {
    expiration: { type: exType, value: exValue },
  });
}
export async function hSet({ key, field, value, exType = "EX", exValue = 60 }) {
  return await client.hSetEx(key, field, value, {
    expiration: { type: exType, value: exValue },
  });
}

export async function hGet({ key, field }) {
  return await client.hGetEx(key, field);
}

export async function get(key) {
  return await client.get(key);
}

export async function mGet(keys = []) {
  return await client.mGet(keys);
}

export async function ttl(key) {
  return await client.ttl(key);
}

export async function exists(key) {
  return await client.exists(key);
}

export async function persist(key) {
  return await client.persist(key);
}

export async function incr(key) {
  return await client.incr(key);
}

export async function del(keys) {
  return await client.del(keys);
}

export async function update(key, value) {
  if (!(await exists(key))) {
    return 0;
  }

  await client.set(key, value);
  return 1;
}

export function black_List_Token_Key(userId , jti){
  return `blacklist_token::${userId}::${jti}`
}
export function forgot_Password_Otp_Key(email){
  return `forgot_password_otp::${email}`
}
export function two_Step_Verification_Otp_Key(userId){
  return `two_step_verification_otp::${userId}`
}
export function login_Attempt_Key(email){
  return `login_attempt::${email}`
}