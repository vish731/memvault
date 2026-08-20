export interface MemoryRecord {
  id: string;
  kind: "conversation" | "fact" | "document" | "embedding" | "image";
  tags: string[];
  summary: string;
  listed: boolean;
  price_usd: number | string;
  created_at: string;
  expires_at: string;
}

export interface MarketListing extends MemoryRecord {
  alreadyPurchased: boolean;
  isFavorite: boolean;
  avg_rating: number | string | null;
  review_count: number | string;
  creator_wallet_address: string | null;
}
