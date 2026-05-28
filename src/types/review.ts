export type Review = {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ReviewSummary = {
  averageRating: number;
  count: number;
};

export type ReviewListItem = Review & {
  reviewerDisplayName: string;
};
