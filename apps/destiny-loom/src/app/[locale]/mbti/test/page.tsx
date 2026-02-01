"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardContent, ProgressBar } from "@cyberfaith/ui";

// Each question maps to a dimension: E/I, S/N, T/F, J/P
// Positive score = first letter (E, S, T, J), negative = second (I, N, F, P)
const questionDimensions = [
  "EI", "JP", "TF", "EI", "SN", "TF", "JP", "EI", "SN", "TF",
  "JP", "EI", "SN", "TF", "JP", "EI", "SN", "TF", "JP", "EI",
] as const;

// Whether "agree" pushes toward the first letter (true) or second (false)
const questionPolarity = [
  true,  // Q1: Agree → E
  true,  // Q2: Agree → J
  false, // Q3: Agree → F (gut feelings)
  true,  // Q4: Agree → E
  true,  // Q5: Agree → S (details)
  false, // Q6: Agree → F
  true,  // Q7: Agree → J
  true,  // Q8: Agree → E
  false, // Q9: Agree → N (abstract)
  true,  // Q10: Agree → T
  false, // Q11: Agree → P (open options)
  false, // Q12: Agree → I (recharge alone)
  false, // Q13: Agree → N (future)
  false, // Q14: Agree → F
  true,  // Q15: Agree → J
  true,  // Q16: Agree → E
  false, // Q17: Agree → N
  true,  // Q18: Agree → T
  true,  // Q19: Agree → J
  false, // Q20: Agree → I
];

const choiceValues = [2, 1, -1, -2]; // stronglyAgree, agree, disagree, stronglyDisagree

type Scores = { EI: number; SN: number; TF: number; JP: number };

function calculateType(scores: Scores): string {
  return (
    (scores.EI >= 0 ? "E" : "I") +
    (scores.SN >= 0 ? "S" : "N") +
    (scores.TF >= 0 ? "T" : "F") +
    (scores.JP >= 0 ? "J" : "P")
  );
}

export default function MbtiTest() {
  const t = useTranslations("mbti");
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const totalQuestions = 20;

  const questions = Array.from({ length: totalQuestions }, (_, i) =>
    t(`questions.${i}`)
  );

  const choiceKeys = ["stronglyAgree", "agree", "disagree", "stronglyDisagree"] as const;

  function handleAnswer(choiceIndex: number) {
    const value = choiceValues[choiceIndex];
    const dim = questionDimensions[current];
    const polarity = questionPolarity[current];
    const score = polarity ? value : -value;

    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (current + 1 < totalQuestions) {
      setCurrent(current + 1);
    } else {
      // Calculate result
      const scores: Scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
      newAnswers.forEach((s, i) => {
        const d = questionDimensions[i];
        scores[d] += s;
      });
      const type = calculateType(scores);
      const scoresParam = encodeURIComponent(JSON.stringify(scores));
      router.push(`/mbti/result?type=${type}&scores=${scoresParam}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <ProgressBar value={current + 1} max={totalQuestions} variant="accent" className="h-3" />
      <p className="text-sm text-muted-foreground text-center">
        {t("question", { current: current + 1, total: totalQuestions })}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border-primary/20">
            <CardContent className="p-8 space-y-8">
              <h2 className="text-xl font-semibold text-center leading-relaxed">
                {questions[current]}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {choiceKeys.map((key, i) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="lg"
                    className="justify-center text-base"
                    onClick={() => handleAnswer(i)}
                  >
                    {t(`choices.${key}`)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
