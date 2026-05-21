export const AMENITY_KEYS = [
  'in_unit_laundry',
  'laundry_in_building',
  'dishwasher',
  'doorman',
  'elevator',
  'outdoor_space',
  'building_amenities',
  'pets_allowed',
  'no_broker_fee',
  'furnished',
  'central_ac',
  'utilities_included',
  'parking'
] as const;

export const AMENITY_LABELS: Record<typeof AMENITY_KEYS[number], string> = {
  in_unit_laundry: 'In-unit laundry',
  laundry_in_building: 'Laundry in building',
  dishwasher: 'Dishwasher',
  doorman: 'Doorman',
  elevator: 'Elevator',
  outdoor_space: 'Outdoor space',
  building_amenities: 'Building amenities',
  pets_allowed: 'Pets allowed',
  no_broker_fee: 'No broker fee',
  furnished: 'Furnished',
  central_ac: 'Central AC',
  utilities_included: 'Utilities included',
  parking: 'Parking'
};

export type AmenityKey = typeof AMENITY_KEYS[number];
