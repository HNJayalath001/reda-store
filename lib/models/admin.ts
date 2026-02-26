import { ObjectId } from "mongodb";

export interface Admin {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  role: string;
  name: string;
  createdAt: Date;
}
