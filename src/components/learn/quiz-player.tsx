"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type QuizQuestionData = {
  id: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string | null;
};

export default function QuizPlayer({
  questions,
}: {
  questions: QuizQuestionData[];
}) {
  const t = useTranslations("content");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  if (questions.length === 0) return null;

  const q = questions[step];
  const isLast = step === questions.length - 1;
  const finished = step >= questions.length;

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (selected === q.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    setSelected(null);
    setChecked(false);
    setStep((s) => s + 1);
  }

  function retry() {
    setSelected(null);
    setChecked(false);
    setScore(0);
    setStep(0);
  }

  if (finished) {
    return (
      <div className="rounded-xl border border-ligne bg-white p-6 text-center">
        <p className="text-lg font-medium">
          {t("quizFinished", { score, total: questions.length })}
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-lg border border-majorelle px-5 py-2 text-sm font-medium text-majorelle transition-colors hover:bg-majorellel"
        >
          {t("quizRetry")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ligne bg-white p-6">
      <p className="text-xs text-mutedink" dir="ltr">
        {step + 1} / {questions.length}
      </p>
      <p className="mt-2 text-lg font-medium leading-relaxed">{q.prompt}</p>
      <div className="mt-4 space-y-2">
        {q.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrect = checked && i === q.correctIndex;
          const isWrong = checked && isSelected && i !== q.correctIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => setSelected(i)}
              className={`block w-full rounded-lg border px-4 py-2.5 text-start text-sm transition-colors ${
                isCorrect
                  ? "border-oasis bg-oasisl text-oasis"
                  : isWrong
                    ? "border-terracotta bg-terracottal text-terracotta"
                    : isSelected
                      ? "border-majorelle bg-majorellel text-majorelle"
                      : "border-ligne bg-white hover:border-majorelle"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {checked ? (
        <div className="mt-4">
          <p
            className={`text-sm font-medium ${selected === q.correctIndex ? "text-oasis" : "text-terracotta"}`}
          >
            {selected === q.correctIndex ? t("quizCorrect") : t("quizIncorrect")}
          </p>
          {q.explanation ? (
            <p className="mt-1 text-sm text-mutedink">{q.explanation}</p>
          ) : null}
          <button
            type="button"
            onClick={next}
            className="mt-3 rounded-lg bg-majorelle px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {isLast ? t("quizSeeResults") : t("quizNext")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={check}
          disabled={selected === null}
          className="mt-4 rounded-lg bg-majorelle px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t("quizCheck")}
        </button>
      )}
    </div>
  );
}
