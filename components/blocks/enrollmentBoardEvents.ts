export const ENROLLMENT_BOARD_PROFILE_EVENT =
  "kht:enrollment-board-profile-updated";

export type EnrollmentBoardProfileEventDetail = {
  micrositeId: string;
  enrollmentBlockId: string;
  linkedProfileImageBlockId?: string;
  linkedNameLabelBlockId?: string;
  linkedQuoteLabelBlockId?: string;
  profileImageUrl?: string | null;
  name?: string | null;
  quote?: string | null;
  activeCount?: number;
};