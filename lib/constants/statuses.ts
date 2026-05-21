export const APARTMENT_STATUSES = [
  'interested',
  'reached_out',
  'tour_scheduled',
  'toured',
  'applied',
  'accepted',
  'passed',
  'lost'
] as const;

export type ApartmentStatus = typeof APARTMENT_STATUSES[number];

export const APARTMENT_STATUS_LABELS: Record<ApartmentStatus, string> = {
  interested: 'Interested',
  reached_out: 'Reached Out',
  tour_scheduled: 'Tour Scheduled',
  toured: 'Toured',
  applied: 'Applied',
  accepted: 'Accepted',
  passed: 'Passed',
  lost: 'Lost'
};
