/* This file is auto-generated, any changes will be overwritten ! */

const typeDefinition = `
type PostalCodeChanges {
  id: Int
  record: String
  level: String
  updatedAt: Date
  extractionStartAt: Date
  extractionEndAt: Date
  oldPostalCode: String
  oldPostOfficeName: String
  oldPostOfficeNameSwe: String
  oldPostOfficeShortName: String
  oldPostOfficeShortNameSwe: String
  reserved: String
  postalCode: String
  postOfficeName: String
  postOfficeNameSwe: String
  postOfficeShortName: String
  postOfficeShortNameSwe: String
  municipalityIdCode: String
  municipalityName: String
  municipalityNameSwe: String
  regionId: String
  regionName: String
  regionNameSwe: String
  changedAt: Date
  ### eventCode comments:
  # - 1 = Change of name
  # - 2 = Postal code closed
  # - 3 = New postal code
  # - 4 = Postal code merged
  # - 5 = Postal code reactivation
  # - 6 = Postal code replaced by new postal code
  ###
  eventCode: Int
}
`;

export default typeDefinition;
