/* This file is auto-generated, any changes will be overwritten ! */

const typeDefinition = `
type PostalCode {
  id: Int
  record: String
  updatedAt: Date
  postalCode: String
  postOfficeName: String
  postOfficeNameSwe: String
  postOfficeShortName: String
  postOfficeShortNameSwe: String
  entryIntoForceAt: Date
  ### typeCode comments:
  # - 1 = Normal postcode
  # - 2 = PO Box postcode
  # - 3 = Corporate postal code
  # - 4 = Compilation postcode
  # - 5 = Reply Mail postcode
  # - 6 = SmartPOST (Parcel machine)
  # - 7 = Pick-up Point postcode
  # - 8 = Technical postcode
  ###
  typeCode: Int
  regionId: String
  regionName: String
  regionNameSwe: String
  municipalityIdCode: String
  municipalityName: String
  municipalityNameSwe: String
  ### municipalityLanguage comments:
  # - 1 = Finnish
  # - 2 = Bilingual
  # - 3 = Bilingual
  # - 4 = Swedish
  ###
  municipalityLanguage: Int
}
`;

export default typeDefinition;
