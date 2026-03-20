import { describe, expect, it } from "vitest";
import type { FieldDefinition } from "../../src/parser/field-definitions.js";
import { addressFields, zipcodeChangeFields, zipcodeFields } from "../../src/parser/field-definitions.js";
import { castValue, parseLine } from "../../src/parser/line-parser.js";

/**
 * Build a fixed-width line from field definitions and values.
 * Pads each value to the correct position and length.
 */
function buildLine(fields: FieldDefinition[], values: Record<string, string>): string {
  // Find total line length
  let maxEnd = 0;
  for (const field of fields) {
    if (field.start !== undefined) {
      const end = field.start - 1 + field.length;
      if (end > maxEnd) maxEnd = end;
    }
  }

  const chars = new Array<string>(maxEnd).fill(" ");

  for (const field of fields) {
    if (field.start !== undefined) {
      const val = values[field.name] ?? "";
      for (let i = 0; i < field.length; i++) {
        chars[field.start - 1 + i] = val[i] ?? " ";
      }
    }
  }

  return chars.join("");
}

describe("castValue", () => {
  it("should return null for empty string", () => {
    expect(castValue("", "string")).toBeNull();
    expect(castValue("", "integer")).toBeNull();
    expect(castValue("", "date")).toBeNull();
  });

  it("should return string as-is for string type", () => {
    expect(castValue("hello", "string")).toBe("hello");
    expect(castValue("00100", "string")).toBe("00100");
  });

  it("should parse integer type", () => {
    expect(castValue("42", "integer")).toBe(42);
    expect(castValue("00001", "integer")).toBe(1);
    expect(castValue("0", "integer")).toBe(0);
  });

  it("should parse YYYYMMDD date type", () => {
    expect(castValue("20240120", "date")).toBe("2024-01-20");
    expect(castValue("20231231", "date")).toBe("2023-12-31");
  });

  it("should return null for invalid date", () => {
    expect(castValue("abc", "date")).toBeNull();
  });

  it("should return null for non-numeric integer value", () => {
    expect(castValue("abc", "integer")).toBeNull();
    expect(castValue("twelve", "integer")).toBeNull();
  });

  it("should parse leading-number strings as integer", () => {
    expect(castValue("42abc", "integer")).toBe(42);
  });
});

describe("parseLine - BAF (addresses)", () => {
  it("should parse all address fields correctly", () => {
    const values: Record<string, string> = {
      record: "BASIC",
      updatedAt: "20240120",
      postalCode: "00100",
      postOfficeName: "HELSINKI",
      postOfficeNameSwe: "HELSINGFORS",
      postOfficeShortName: "HELSINKI",
      postOfficeShortNameSwe: "HELSINGFORS",
      address: "Mannerheimintie",
      addressSwe: "Mannerheimvägen",
      empty1: "",
      empty2: "",
      oddEven: "1",
      smallestBuildingNumber1: "00001",
      smallestDeliveryLetter1: "A",
      divider1: "-",
      smallestBuildingNumber2: "00002",
      smallestDeliveryLetter2: "B",
      highestBuildingNumber1: "00099",
      highestDeliveryLetter1: "C",
      divider2: "-",
      highestBuildingNumber2: "00100",
      highestDeliveryLetter2: "D",
      municipalityIdCode: "091",
      municipalityName: "HELSINKI",
      municipalityNameSwe: "HELSINGFORS",
    };

    const line = buildLine(addressFields, values);
    const result = parseLine(line, addressFields);

    expect(result.record).toBe("BASIC");
    expect(result.updatedAt).toBe("2024-01-20");
    expect(result.postalCode).toBe("00100");
    expect(result.postOfficeName).toBe("HELSINKI");
    expect(result.postOfficeNameSwe).toBe("HELSINGFORS");
    expect(result.postOfficeShortName).toBe("HELSINKI");
    expect(result.postOfficeShortNameSwe).toBe("HELSINGFORS");
    expect(result.address).toBe("Mannerheimintie");
    expect(result.addressSwe).toBe("Mannerheimvägen");
    expect(result.empty1).toBeNull();
    expect(result.empty2).toBeNull();
    expect(result.oddEven).toBe(1);
    expect(result.smallestBuildingNumber1).toBe(1);
    expect(result.smallestDeliveryLetter1).toBe("A");
    expect(result.divider1).toBe("-");
    expect(result.smallestBuildingNumber2).toBe(2);
    expect(result.smallestDeliveryLetter2).toBe("B");
    expect(result.highestBuildingNumber1).toBe(99);
    expect(result.highestDeliveryLetter1).toBe("C");
    expect(result.divider2).toBe("-");
    expect(result.highestBuildingNumber2).toBe(100);
    expect(result.highestDeliveryLetter2).toBe("D");
    expect(result.municipalityIdCode).toBe("091");
    expect(result.municipalityName).toBe("HELSINKI");
    expect(result.municipalityNameSwe).toBe("HELSINGFORS");
  });

  it("should handle empty/blank fields", () => {
    const values: Record<string, string> = {
      record: "BASIC",
      updatedAt: "20240120",
      postalCode: "00100",
      postOfficeName: "HELSINKI",
    };

    const line = buildLine(addressFields, values);
    const result = parseLine(line, addressFields);

    expect(result.record).toBe("BASIC");
    expect(result.postalCode).toBe("00100");
    // Empty fields should be null
    expect(result.address).toBeNull();
    expect(result.oddEven).toBeNull();
    expect(result.smallestBuildingNumber1).toBeNull();
  });
});

describe("parseLine - PCF (zipcodes)", () => {
  it("should parse all zipcode fields correctly", () => {
    const values: Record<string, string> = {
      record: "BASIC",
      updatedAt: "20240120",
      postalCode: "00100",
      postOfficeName: "HELSINKI",
      postOfficeNameSwe: "HELSINGFORS",
      postOfficeShortName: "HELSINKI",
      postOfficeShortNameSwe: "HELSINGFORS",
      entryIntoForceAt: "19900101",
      typeCode: "1",
      regionId: "01",
      regionName: "Uudenmaan maakunta",
      regionNameSwe: "Landskapet Nyland",
      municipalityIdCode: "091",
      municipalityName: "HELSINKI",
      municipalityNameSwe: "HELSINGFORS",
      municipalityLanguage: "2",
    };

    const line = buildLine(zipcodeFields, values);
    const result = parseLine(line, zipcodeFields);

    expect(result.record).toBe("BASIC");
    expect(result.updatedAt).toBe("2024-01-20");
    expect(result.postalCode).toBe("00100");
    expect(result.postOfficeName).toBe("HELSINKI");
    expect(result.postOfficeNameSwe).toBe("HELSINGFORS");
    expect(result.postOfficeShortName).toBe("HELSINKI");
    expect(result.postOfficeShortNameSwe).toBe("HELSINGFORS");
    expect(result.entryIntoForceAt).toBe("1990-01-01");
    expect(result.typeCode).toBe(1);
    expect(result.regionId).toBe("01");
    expect(result.regionName).toBe("Uudenmaan maakunta");
    expect(result.regionNameSwe).toBe("Landskapet Nyland");
    expect(result.municipalityIdCode).toBe("091");
    expect(result.municipalityName).toBe("HELSINKI");
    expect(result.municipalityNameSwe).toBe("HELSINGFORS");
    expect(result.municipalityLanguage).toBe(2);
  });
});

describe("parseLine - POM (zipcode changes)", () => {
  it("should parse all zipcode change fields correctly", () => {
    const values: Record<string, string> = {
      record: "CHNG",
      level: "1",
      updatedAt: "20240120",
      extractionStartAt: "20240101",
      extractionEndAt: "20240131",
      oldPostalCode: "00100",
      oldPostOfficeName: "OLD HELSINKI",
      oldPostOfficeNameSwe: "GAMLA HELSINGFORS",
      oldPostOfficeShortName: "OLD HELS",
      oldPostOfficeShortNameSwe: "GAMLA HELS",
      reserved: "",
      postalCode: "00101",
      postOfficeName: "NEW HELSINKI",
      postOfficeNameSwe: "NYA HELSINGFORS",
      postOfficeShortName: "NEW HELS",
      postOfficeShortNameSwe: "NYA HELS",
      municipalityIdCode: "091",
      municipalityName: "HELSINKI",
      municipalityNameSwe: "HELSINGFORS",
      regionId: "01",
      regionName: "Uudenmaan maakunta",
      regionNameSwe: "Landskapet Nyland",
      changedAt: "20240115",
      eventCode: "3",
    };

    const line = buildLine(zipcodeChangeFields, values);
    const result = parseLine(line, zipcodeChangeFields);

    expect(result.record).toBe("CHNG");
    expect(result.level).toBe("1");
    expect(result.updatedAt).toBe("2024-01-20");
    expect(result.extractionStartAt).toBe("2024-01-01");
    expect(result.extractionEndAt).toBe("2024-01-31");
    expect(result.oldPostalCode).toBe("00100");
    expect(result.oldPostOfficeName).toBe("OLD HELSINKI");
    expect(result.oldPostOfficeNameSwe).toBe("GAMLA HELSINGFORS");
    expect(result.oldPostOfficeShortName).toBe("OLD HELS");
    expect(result.oldPostOfficeShortNameSwe).toBe("GAMLA HELS");
    expect(result.postalCode).toBe("00101");
    expect(result.postOfficeName).toBe("NEW HELSINKI");
    expect(result.postOfficeNameSwe).toBe("NYA HELSINGFORS");
    expect(result.postOfficeShortName).toBe("NEW HELS");
    expect(result.postOfficeShortNameSwe).toBe("NYA HELS");
    expect(result.municipalityIdCode).toBe("091");
    expect(result.municipalityName).toBe("HELSINKI");
    expect(result.municipalityNameSwe).toBe("HELSINGFORS");
    expect(result.regionId).toBe("01");
    expect(result.regionName).toBe("Uudenmaan maakunta");
    expect(result.regionNameSwe).toBe("Landskapet Nyland");
    expect(result.changedAt).toBe("2024-01-15");
    expect(result.eventCode).toBe(3);
  });
});

function expectNoOverlaps(fields: FieldDefinition[]) {
  const parseable = fields.filter((f): f is FieldDefinition & { start: number } => f.start !== undefined);
  for (let i = 0; i < parseable.length; i++) {
    const a = parseable[i];
    if (!a) continue;
    for (let j = i + 1; j < parseable.length; j++) {
      const b = parseable[j];
      if (!b) continue;
      const aEnd = a.start + a.length - 1;
      const bEnd = b.start + b.length - 1;
      const overlaps = a.start <= bEnd && b.start <= aEnd;
      expect(overlaps, `${a.name} overlaps with ${b.name}`).toBe(false);
    }
  }
}

describe("field definitions", () => {
  it("should have correct number of address fields", () => {
    const parseableFields = addressFields.filter((f) => f.start !== undefined);
    expect(parseableFields.length).toBe(25);
  });

  it("should have correct number of zipcode fields", () => {
    const parseableFields = zipcodeFields.filter((f) => f.start !== undefined);
    expect(parseableFields.length).toBe(16);
  });

  it("should have correct number of zipcode change fields", () => {
    const parseableFields = zipcodeChangeFields.filter((f) => f.start !== undefined);
    expect(parseableFields.length).toBe(24);
  });

  it("address fields should not overlap", () => {
    expectNoOverlaps(addressFields);
  });

  it("zipcode fields should not overlap", () => {
    expectNoOverlaps(zipcodeFields);
  });

  it("zipcode change fields should not overlap", () => {
    expectNoOverlaps(zipcodeChangeFields);
  });
});
