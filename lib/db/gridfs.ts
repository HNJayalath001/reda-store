import { GridFSBucket } from "mongodb";
import clientPromise from "./mongodb";

let bucket: GridFSBucket;

export async function getBucket(): Promise<GridFSBucket> {
  if (bucket) return bucket;
  const client = await clientPromise;
  const db = client.db("reda_store");
  bucket = new GridFSBucket(db, { bucketName: "images" });
  return bucket;
}
