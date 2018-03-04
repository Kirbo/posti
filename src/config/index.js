
const CONFIGS = {
  webpcode: {
    index: 'https://www.posti.fi/webpcode/',
    files: 'http://www.posti.fi/webpcode',
  },
  delete_on_complete: true, // Should the temporary data directory be removed after all steps.
  chunk_size: 1000, // In how big chunks do we want to insert the data into database.
  concurrency: 5,
};

/* eslint-disable */
const ADDRESSES = {
  record:                         [  1,   5],   // Tietuetunnus
  updatedAt:                      [  6,   8],   // Ajopäivämäärä
  zipcode:                        [ 14,   5],   // Postinumero
  postOfficeName:                 [ 19,  30],   // Postinumeron nimi suomeksi
  postOfficeNameSwe:              [ 49,  30],   // Postinumeron nimi ruotsiksi
  postOfficeShortName:            [ 79,  12],   // Postinumeron nimen lyhenne suomeksi
  postOfficeShortNameSwe:         [ 91,  12],   // Postinumeron nimen lyhenne ruotsiksi
  address:                        [103,  30],   // Kadun (paikan) nimi suomeksi
  addressSwe:                     [133,  30],   // Kadun (paikan) nimi ruotsiksi
  empty1:                         [163,  12],   // Tyhjä
  empty2:                         [175,  12],   // Tyhjä
  oddEven:                        [187,   1],   // Kiinteistötietojen tyyppi

  lowestPropertyNumber1:          [188,   5],   // Kiinteistönumero 1 (Pienin kiinteistönumero)
  lowestDistributionLetter1:      [193,   1],   // Kiinteistön jakokirjain 1
  divider1:                       [194,   1],   // Välimerkki
  lowestPropertyNumber2:          [195,   5],   // Kiinteistönumero 2
  lowestDistributionLetter2:      [200,   1],   // Kiinteistön jakokirjain 2

  highestPropertyNumber1:         [201,   5],   // Kiinteistönumero 1 (Suurin kiinteistönumero)
  highestDistributionLetter1:     [206,   1],   // Kiinteistön jakokirjain 1
  divider2:                       [207,   1],   // Välimerkki
  highestPropertyNumber2:         [208,   5],   // Kiinteistönumero 2
  highestDistributionLetter2:     [213,   1],   // Kiinteistön jakokirjain 2

  municipalityIdCode:             [214,   3],   // Kunnan koodi
  municipalityName:               [217,  20],   // Kunnan nimi suomeksi
  municipalityNameSwe:            [237,  20],   // Kunnan nimi ruotsiksi
}

const ZIPCODES = {
  record:                         [  1,   5],   // Tietuetunnus
  updatedAt:                      [  6,   8],   // Ajopäivämäärä
  zipcode:                        [ 14,   5],   // Postinumero
  postOfficeName:                 [ 19,  30],   // Postinumeron nimi suomeksi
  postOfficeNameSwe:              [ 49,  30],   // Postinumeron nimi ruotsiksi
  postOfficeShortName:            [ 79,  12],   // Postinumeron nimen lyhenne suomeksi
  postOfficeShortNameSwe:         [ 91,  12],   // Postinumeron nimen lyhenne ruotsiksi
  effectiveAt:                    [103,   8],   // Voimaantulopäivämäärä
  typeCode:                       [111,   1],   // Tyyppikoodi
  regionId:                       [112,   5],   // Hallinnollisen alueen koodi
  regionName:                     [117,  30],   // Hallinnollisen alueen nimi suomeksi
  regionNameSwe:                  [147,  30],   // Hallinnollisen alueen ruotsiksi

  municipalityIdCode:             [177,   3],   // Kunnan koodi
  municipalityName:               [180,  20],   // Kunnan nimi suomeksi
  municipalityNameSwe:            [200,  20],   // Kunnan nimi ruotsiksi
  municipalityLanguage:           [220,   1],   // Kunnan kielisuhdekoodi
}

const ZIPCODE_CHANGES = {
  record:                         [  1,   4],   // Tietuetunnus
  level:                          [  5,   1],   // Taso
  updatedAt:                      [  6,   8],   // Ajopäivämäärä
  pickingStartAt:                 [ 14,   8],   // Poiminnan alkupäivämäärä
  pickingEndAt:                   [ 22,   8],   // Poiminnan loppupäivämäärä
  oldZipcode:                     [ 30,   5],   // Vanha postinumero
  oldPostOfficeName:              [ 35,  30],   // Vanha postinumeron nimi suomeksi
  oldPostOfficeNameSwe:           [ 65,  30],   // Vanha postinumeron nimi ruotsiksi
  oldPostOfficeShortName:         [ 95,  12],   // Vanha postinumeron nimen lyhenne suomeksi
  oldPostOfficeShortNameSwe:      [107,  12],   // Vanha postinumeron nimen lyhenne ruotsiksi
  reserved:                       [119, 131],   // Varalla
  zipcode:                        [250,   5],   // Postinumero
  postOfficeName:                 [255,  30],   // Postinumeron nimi suomeksi
  postOfficeNameSwe:              [285,  30],   // Postinumeron nimi ruotsiksi
  postOfficeShortName:            [315,  12],   // Postinumeron nimen lyhenne suomeksi
  postOfficeShortNameSwe:         [327,  12],   // Postinumeron nimen lyhenne ruotsiksi

  municipalityIdCode:             [339,   3],   // Kunnan koodi
  municipalityName:               [342,  20],   // Kunnan nimi suomeksi
  municipalityNameSwe:            [362,  20],   // Kunnan nimi ruotsiksi
  regionId:                       [382,   2],   // Hallinnollisen alueen koodi
  regionName:                     [384,  30],   // Hallinnollisen alueen nimi suomeksi
  regionNameSwe:                  [414,  30],   // Hallinnollisen alueen ruotsiksi

  changedAt:                      [444,   8],   // Muutospäivämäärä
  transactionId:                  [452,   2],   // Tapahtumakoodi
}
/* eslint-enable */

const PARSERS = {
  ADDRESSES,
  ZIPCODES,
  ZIPCODE_CHANGES,
};

export default CONFIGS;

export {
  PARSERS,
};
