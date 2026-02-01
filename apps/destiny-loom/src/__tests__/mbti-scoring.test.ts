import { describe, it, expect } from "vitest";

// Reproduce the scoring function from the API route for testing
interface MBTIAnswer {
  questionId: number;
  dimension: "EI" | "SN" | "TF" | "JP";
  value: string;
}

function computeMBTIType(answers: MBTIAnswer[]): string {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const answer of answers) {
    scores[answer.value] = (scores[answer.value] || 0) + 1;
  }
  const ei = scores.E >= scores.I ? "E" : "I";
  const sn = scores.S >= scores.N ? "S" : "N";
  const tf = scores.T >= scores.F ? "T" : "F";
  const jp = scores.J >= scores.P ? "J" : "P";
  return `${ei}${sn}${tf}${jp}`;
}

describe("MBTI Scoring Edge Cases", () => {
  it("all E answers → ESTJ", () => {
    const answers: MBTIAnswer[] = [
      { questionId: 1, dimension: "EI", value: "E" },
      { questionId: 2, dimension: "EI", value: "E" },
      { questionId: 3, dimension: "EI", value: "E" },
      { questionId: 4, dimension: "EI", value: "E" },
      { questionId: 5, dimension: "EI", value: "E" },
    ];
    const type = computeMBTIType(answers);
    expect(type).toBe("ESTJ"); // E wins, S/N tied → S, T/F tied → T, J/P tied → J (>= means first wins on tie)
  });

  it("all I answers → INFP (I wins, ties go to first: S≥N→S... wait, all I)", () => {
    const answers: MBTIAnswer[] = Array(5).fill(null).map((_, i) => ({
      questionId: i + 1,
      dimension: "EI" as const,
      value: "I",
    }));
    const type = computeMBTIType(answers);
    // Only I has scores. E=0, I=5 → I. S=0,N=0 → S(tie, >=). T=0,F=0 → T. J=0,P=0 → J
    expect(type).toBe("ISTJ");
  });

  it("alternating answers across all dimensions", () => {
    const answers: MBTIAnswer[] = [
      { questionId: 1, dimension: "EI", value: "E" },
      { questionId: 2, dimension: "EI", value: "I" },
      { questionId: 3, dimension: "SN", value: "S" },
      { questionId: 4, dimension: "SN", value: "N" },
      { questionId: 5, dimension: "TF", value: "T" },
      { questionId: 6, dimension: "TF", value: "F" },
      { questionId: 7, dimension: "JP", value: "J" },
      { questionId: 8, dimension: "JP", value: "P" },
    ];
    const type = computeMBTIType(answers);
    // All tied → >= means E, S, T, J win
    expect(type).toBe("ESTJ");
  });

  it("strong introvert with mixed other dimensions", () => {
    const answers: MBTIAnswer[] = [
      { questionId: 1, dimension: "EI", value: "I" },
      { questionId: 2, dimension: "EI", value: "I" },
      { questionId: 3, dimension: "EI", value: "I" },
      { questionId: 4, dimension: "SN", value: "N" },
      { questionId: 5, dimension: "SN", value: "N" },
      { questionId: 6, dimension: "SN", value: "S" },
      { questionId: 7, dimension: "TF", value: "F" },
      { questionId: 8, dimension: "TF", value: "F" },
      { questionId: 9, dimension: "JP", value: "P" },
      { questionId: 10, dimension: "JP", value: "P" },
    ];
    const type = computeMBTIType(answers);
    expect(type).toBe("INFP");
  });

  it("single answer only", () => {
    const answers: MBTIAnswer[] = [
      { questionId: 1, dimension: "EI", value: "E" },
    ];
    const type = computeMBTIType(answers);
    expect(type).toBe("ESTJ"); // E=1, rest tied at 0 → first letter wins
  });

  it("empty answers returns ESTJ (all ties)", () => {
    const type = computeMBTIType([]);
    expect(type).toBe("ESTJ");
  });

  it("produces valid 4-letter type", () => {
    const answers: MBTIAnswer[] = [
      { questionId: 1, dimension: "EI", value: "I" },
      { questionId: 2, dimension: "SN", value: "N" },
      { questionId: 3, dimension: "TF", value: "F" },
      { questionId: 4, dimension: "JP", value: "J" },
    ];
    const type = computeMBTIType(answers);
    expect(type).toMatch(/^[EI][SN][TF][JP]$/);
    expect(type).toBe("INFJ");
  });
});
