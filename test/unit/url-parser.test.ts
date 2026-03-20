import { describe, expect, it } from "vitest";
import { parseFileUrls } from "../../src/fetcher/url-parser.js";

const sampleHtml = `
<ul>
<li><a href="https://www.posti.fi/webpcode/BAF_20240120.zip">BAF_20240120.zip</a></li>
<li><a href="https://www.posti.fi/webpcode/PCF_20240120.zip">PCF_20240120.zip</a></li>
<li><a href="https://www.posti.fi/webpcode/POM_20240120.zip">POM_20240120.zip</a></li>
</ul>
`;

describe("parseFileUrls", () => {
  it("should extract BAF, PCF, and POM URLs from HTML", () => {
    const files = parseFileUrls(sampleHtml);
    expect(files).toHaveLength(3);
  });

  it("should parse BAF file correctly", () => {
    const files = parseFileUrls(sampleHtml);
    const baf = files.find((f) => f.fileType === "BAF");
    expect(baf).toBeDefined();
    expect(baf?.filename).toBe("BAF_20240120.zip");
    expect(baf?.extensionless).toBe("BAF_20240120");
    expect(baf?.url).toContain("BAF_20240120.zip");
  });

  it("should parse PCF file correctly", () => {
    const files = parseFileUrls(sampleHtml);
    const pcf = files.find((f) => f.fileType === "PCF");
    expect(pcf).toBeDefined();
    expect(pcf?.filename).toBe("PCF_20240120.zip");
    expect(pcf?.extensionless).toBe("PCF_20240120");
  });

  it("should parse POM file correctly", () => {
    const files = parseFileUrls(sampleHtml);
    const pom = files.find((f) => f.fileType === "POM");
    expect(pom).toBeDefined();
    expect(pom?.filename).toBe("POM_20240120.zip");
    expect(pom?.extensionless).toBe("POM_20240120");
  });

  it("should return empty array for HTML with no matching links", () => {
    const files = parseFileUrls("<html><body>No links here</body></html>");
    expect(files).toHaveLength(0);
  });

  it("should ignore non-BAF/PCF/POM zip files", () => {
    const html = `
      <a href="https://www.posti.fi/webpcode/OTHER_20240120.zip">other</a>
      <a href="https://www.posti.fi/webpcode/BAF_20240120.zip">baf</a>
    `;
    const files = parseFileUrls(html);
    expect(files).toHaveLength(1);
    expect(files[0]?.fileType).toBe("BAF");
  });
});
