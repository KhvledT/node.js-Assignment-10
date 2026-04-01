import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";

export const client = createClient({
  url: REDIS_URL,
});

export async function redisConnection() {
  try {
    await client.connect();
    console.log("Redis Connected Successfully");
  } catch (error) {
    console.error("Redis Connection Error:", error);
  }
}
