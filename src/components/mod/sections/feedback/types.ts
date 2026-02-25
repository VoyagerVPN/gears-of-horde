export type FeedbackType = 'comment' | 'review';
export type SortOption = 'newest' | 'popular' | 'highestRating' | 'lowestRating';

export interface FeedbackItem {
    id: number;
    date: string;
    user: string;
    type: FeedbackType;
    rating?: number;
    content: string;
    likes: number;
}
