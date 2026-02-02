import { NextRequest, NextResponse } from "next/server";

// Simple PDF generation without external dependencies
// Produces a minimal valid PDF with reading summaries

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(readings: any[]): Buffer {
  const lines: string[] = [];
  let y = 750;

  // Header
  lines.push(`BT /F1 18 Tf 50 ${y} Td (CyberFaith - Reading History) Tj ET`);
  y -= 30;
  lines.push(`BT /F1 10 Tf 50 ${y} Td (Exported: ${new Date().toISOString().slice(0, 10)}) Tj ET`);
  y -= 30;

  const pages: string[][] = [[]];
  let currentPage = 0;

  for (const reading of readings) {
    if (y < 80) {
      y = 750;
      currentPage++;
      pages.push([]);
    }

    const date = new Date(reading.createdAt).toLocaleDateString();
    const type = reading.type || "unknown";
    const fav = reading.isFavorite ? " [FAV]" : "";
    const summary = reading.result?.summary || reading.result?.interpretation || "";
    const truncSummary = summary.length > 100 ? summary.slice(0, 100) + "..." : summary;

    pages[currentPage].push(
      `BT /F1 11 Tf 50 ${y} Td (${escapeText(`${date} - ${type.toUpperCase()}${fav}`)}) Tj ET`
    );
    y -= 16;

    if (truncSummary) {
      pages[currentPage].push(
        `BT /F1 9 Tf 60 ${y} Td (${escapeText(truncSummary)}) Tj ET`
      );
      y -= 14;
    }
    y -= 10;
  }

  // If first page empty, add the header content
  if (pages[0].length === 0) {
    pages[0] = lines;
  } else {
    pages[0] = [...lines, ...pages[0]];
  }

  // Build PDF
  const objects: string[] = [];
  const offsets: number[] = [];
  let content = "%PDF-1.4\n";

  // Object 1: Catalog
  offsets.push(content.length);
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  content += objects[objects.length - 1];

  // Object 2: Pages
  const pageRefs = pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ");
  offsets.push(content.length);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj\n`);
  content += objects[objects.length - 1];

  const fontObjNum = 3 + pages.length * 2;

  for (let i = 0; i < pages.length; i++) {
    const pageObjNum = 3 + i * 2;
    const streamObjNum = 4 + i * 2;
    const stream = pages[i].join("\n");

    // Page object
    offsets.push(content.length);
    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${streamObjNum} 0 R /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> >>\nendobj\n`
    );
    content += objects[objects.length - 1];

    // Stream object
    offsets.push(content.length);
    objects.push(
      `${streamObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
    content += objects[objects.length - 1];
  }

  // Font object
  offsets.push(content.length);
  objects.push(
    `${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  );
  content += objects[objects.length - 1];

  // XRef
  const xrefOffset = content.length;
  const totalObjs = offsets.length + 1;
  let xref = `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  content += xref;
  content += `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(content, "latin1");
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";
  const queryParams = new URLSearchParams({ limit: "200" });
  if (params.get("type")) queryParams.set("type", params.get("type")!);
  if (params.get("favorited")) queryParams.set("favorited", params.get("favorited")!);
  if (params.get("from")) queryParams.set("from", params.get("from")!);
  if (params.get("to")) queryParams.set("to", params.get("to")!);

  try {
    const res = await fetch(`${apiUrl}/readings?${queryParams}`, {
      headers: { Authorization: authHeader },
    });
    const json = await res.json();
    if (!json.success) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    const pdfBuffer = buildPdf(json.data || []);
    const uint8 = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reading-history.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
