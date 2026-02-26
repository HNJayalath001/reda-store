import { ObjectId } from "mongodb";

export interface Product {
  _id?: ObjectId;
  name: string;
  brand: string;
  category: string;
  sku: string;
  description: string;
  gettingPrice: number;
  sellingPrice: number;
  stockQty: number;
  imageFileIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPublic {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  sellingPrice: number;
  stockQty: number;
  imageFileIds: string[];
}

export function toPublicProduct(p: Product & { _id: ObjectId }): ProductPublic {
  return {
    _id: p._id.toString(),
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description,
    sellingPrice: p.sellingPrice,
    stockQty: p.stockQty,
    imageFileIds: p.imageFileIds,
  };
}
