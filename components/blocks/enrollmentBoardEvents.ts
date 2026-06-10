export const ENROLLMENT_BOARD_PROFILE_EVENT =
  "kht:enrollment-board-profile-updated";

export type EnrollmentBoardProfileEventDetail = {
  micrositeId: string;
  enrollmentBlockId: string;

  linkedProfileImageBlockId?: string;
  linkedNameLabelBlockId?: string;
  linkedQuoteLabelBlockId?: string;
  linkedGalleryBlockId?: string;
  linkedCarouselBlockId?: string;

  profileImageUrl?: string | null;
  name?: string | null;
  quote?: string | null;
  metadata?: string | null;
  activeCount?: number;

  entries?: Array<{
    id: string;
    name: string;
    quote?: string | null;
    profileImageUrl?: string | null;
    createdAt?: string;
    isMine?: boolean;
  }>;
};