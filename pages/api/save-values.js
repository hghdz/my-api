// pages/api/save-values.js
// pages/api/save-values.js

export default async function handler(req, res) {
  // 1) 모든 도메인 허용 (개발용)
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 2) 프리플라이트(OPTIONS) 요청에 대한 설정
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // 프리플라이트는 204로 바로 응답
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // … (나머지 POST 처리 로직)
}


import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI 환경변수가 필요합니다.");

const client = new MongoClient(uri);
const clientPromise = client.connect();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { email, values } = req.body;
  if (!email || !values) {
    return res.status(400).json({ error: "email 또는 values 누락" });
  }
  try {
    const db = (await clientPromise).db();
    await db.collection("userValues").updateOne(
      { email },
      { $set: { email, values, updatedAt: new Date() } },
      { upsert: true }
    );
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("save-values 에러:", e);
    return res.status(500).json({ error: "서버 에러" });
  }
}
