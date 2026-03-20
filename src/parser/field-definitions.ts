export interface FieldDefinition {
  name: string;
  column: string;
  start?: number;
  length: number;
  type: "string" | "integer" | "date";
}

export type FileType = "BAF" | "PCF" | "POM";

// BAF — address file (fixed-width, 257 chars/line)
export const addressFields: FieldDefinition[] = [
  { name: "record", column: "record", start: 1, length: 5, type: "string" },
  { name: "updatedAt", column: "updated_at", start: 6, length: 8, type: "date" },
  { name: "postalCode", column: "postal_code", start: 14, length: 5, type: "string" },
  { name: "postOfficeName", column: "post_office_name", start: 19, length: 30, type: "string" },
  { name: "postOfficeNameSwe", column: "post_office_name_swe", start: 49, length: 30, type: "string" },
  { name: "postOfficeShortName", column: "post_office_short_name", start: 79, length: 12, type: "string" },
  { name: "postOfficeShortNameSwe", column: "post_office_short_name_swe", start: 91, length: 12, type: "string" },
  { name: "address", column: "address", start: 103, length: 30, type: "string" },
  { name: "addressSwe", column: "address_swe", start: 133, length: 30, type: "string" },
  { name: "empty1", column: "empty1", start: 163, length: 12, type: "string" },
  { name: "empty2", column: "empty2", start: 175, length: 12, type: "string" },
  { name: "oddEven", column: "odd_even", start: 187, length: 1, type: "integer" },
  { name: "smallestBuildingNumber1", column: "smallest_building_number_1", start: 188, length: 5, type: "integer" },
  { name: "smallestDeliveryLetter1", column: "smallest_delivery_letter_1", start: 193, length: 1, type: "string" },
  { name: "divider1", column: "divider_1", start: 194, length: 1, type: "string" },
  { name: "smallestBuildingNumber2", column: "smallest_building_number_2", start: 195, length: 5, type: "integer" },
  { name: "smallestDeliveryLetter2", column: "smallest_delivery_letter_2", start: 200, length: 1, type: "string" },
  { name: "highestBuildingNumber1", column: "highest_building_number_1", start: 201, length: 5, type: "integer" },
  { name: "highestDeliveryLetter1", column: "highest_delivery_letter_1", start: 206, length: 1, type: "string" },
  { name: "divider2", column: "divider_2", start: 207, length: 1, type: "string" },
  { name: "highestBuildingNumber2", column: "highest_building_number_2", start: 208, length: 5, type: "integer" },
  { name: "highestDeliveryLetter2", column: "highest_delivery_letter_2", start: 213, length: 1, type: "string" },
  { name: "municipalityIdCode", column: "municipality_id_code", start: 214, length: 3, type: "string" },
  { name: "municipalityName", column: "municipality_name", start: 217, length: 20, type: "string" },
  { name: "municipalityNameSwe", column: "municipality_name_swe", start: 237, length: 20, type: "string" },
];

// PCF — postal code file (fixed-width, 221 chars/line)
export const zipcodeFields: FieldDefinition[] = [
  { name: "record", column: "record", start: 1, length: 5, type: "string" },
  { name: "updatedAt", column: "updated_at", start: 6, length: 8, type: "date" },
  { name: "postalCode", column: "postal_code", start: 14, length: 5, type: "string" },
  { name: "postOfficeName", column: "post_office_name", start: 19, length: 30, type: "string" },
  { name: "postOfficeNameSwe", column: "post_office_name_swe", start: 49, length: 30, type: "string" },
  { name: "postOfficeShortName", column: "post_office_short_name", start: 79, length: 12, type: "string" },
  { name: "postOfficeShortNameSwe", column: "post_office_short_name_swe", start: 91, length: 12, type: "string" },
  { name: "entryIntoForceAt", column: "entry_into_force_at", start: 103, length: 8, type: "date" },
  { name: "typeCode", column: "type_code", start: 111, length: 1, type: "integer" },
  { name: "regionId", column: "region_id", start: 112, length: 5, type: "string" },
  { name: "regionName", column: "region_name", start: 117, length: 30, type: "string" },
  { name: "regionNameSwe", column: "region_name_swe", start: 147, length: 30, type: "string" },
  { name: "municipalityIdCode", column: "municipality_id_code", start: 177, length: 3, type: "string" },
  { name: "municipalityName", column: "municipality_name", start: 180, length: 20, type: "string" },
  { name: "municipalityNameSwe", column: "municipality_name_swe", start: 200, length: 20, type: "string" },
  { name: "municipalityLanguage", column: "municipality_language", start: 220, length: 1, type: "integer" },
];

// POM — postal code change file (fixed-width, 453 chars/line)
export const zipcodeChangeFields: FieldDefinition[] = [
  { name: "record", column: "record", start: 1, length: 4, type: "string" },
  { name: "level", column: "level", start: 5, length: 1, type: "string" },
  { name: "updatedAt", column: "updated_at", start: 6, length: 8, type: "date" },
  { name: "extractionStartAt", column: "extraction_start_at", start: 14, length: 8, type: "date" },
  { name: "extractionEndAt", column: "extraction_end_at", start: 22, length: 8, type: "date" },
  { name: "oldPostalCode", column: "old_postal_code", start: 30, length: 5, type: "string" },
  { name: "oldPostOfficeName", column: "old_post_office_name", start: 35, length: 30, type: "string" },
  { name: "oldPostOfficeNameSwe", column: "old_post_office_name_swe", start: 65, length: 30, type: "string" },
  { name: "oldPostOfficeShortName", column: "old_post_office_short_name", start: 95, length: 12, type: "string" },
  {
    name: "oldPostOfficeShortNameSwe",
    column: "old_post_office_short_name_swe",
    start: 107,
    length: 12,
    type: "string",
  },
  { name: "reserved", column: "reserved", start: 119, length: 131, type: "string" },
  { name: "postalCode", column: "postal_code", start: 250, length: 5, type: "string" },
  { name: "postOfficeName", column: "post_office_name", start: 255, length: 30, type: "string" },
  { name: "postOfficeNameSwe", column: "post_office_name_swe", start: 285, length: 30, type: "string" },
  { name: "postOfficeShortName", column: "post_office_short_name", start: 315, length: 12, type: "string" },
  { name: "postOfficeShortNameSwe", column: "post_office_short_name_swe", start: 327, length: 12, type: "string" },
  { name: "municipalityIdCode", column: "municipality_id_code", start: 339, length: 3, type: "string" },
  { name: "municipalityName", column: "municipality_name", start: 342, length: 20, type: "string" },
  { name: "municipalityNameSwe", column: "municipality_name_swe", start: 362, length: 20, type: "string" },
  { name: "regionId", column: "region_id", start: 382, length: 2, type: "string" },
  { name: "regionName", column: "region_name", start: 384, length: 30, type: "string" },
  { name: "regionNameSwe", column: "region_name_swe", start: 414, length: 30, type: "string" },
  { name: "changedAt", column: "changed_at", start: 444, length: 8, type: "date" },
  { name: "eventCode", column: "event_code", start: 452, length: 2, type: "integer" },
];

export const fileTypeToFields: Record<FileType, FieldDefinition[]> = {
  BAF: addressFields,
  PCF: zipcodeFields,
  POM: zipcodeChangeFields,
};

export const fileTypeToTable: Record<FileType, string> = {
  BAF: "addresses",
  PCF: "postalcodes",
  POM: "postalcode_changes",
};
