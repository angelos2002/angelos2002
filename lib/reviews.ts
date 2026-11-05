export type Review = {
  id: string;
  location: string;
  rating: number;
  name: string;
  comment: string;
  created_at: string;
  hidden?: boolean;
};

export type ReviewSummary = { average: number; count: number; reviews: Review[] };
