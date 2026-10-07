import test from "node:test";
import assert from "node:assert/strict";
import { createDemoState, generateClassCode, gradeAnswers, normalizeAnswer, normalizeClassCodes, publishSubmission, readDemoState, submitAssignment } from "../src/lib/domain.ts";

test("generates unique 10-character uppercase alpha-numeric class codes", () => {
  const first = generateClassCode();
  const second = generateClassCode([first]);
  assert.match(first, /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{10}$/u);
  assert.match(second, /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{10}$/u);
  assert.notEqual(first, second);
  const state = createDemoState();
  assert.match(state.classes[0].code, /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{10}$/u);
  assert.match(normalizeClassCodes({ ...state, classes: [{ ...state.classes[0], code: "ABCDEFGHIJ" }] }).classes[0].code, /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{10}$/u);
});

function readingState(now = new Date()) {
  const deadline = new Date(now.getTime() + 7 * 86400000).toISOString();
  return {
    ...createDemoState(now),
    assignments: [{ id: "reading-library", classId: "class-foundation", title: "A visit to the library", skill: "Reading" as const, deadline,
      passage: "The Green Library opens at nine every morning.",
      questions: [
        { id: "q1", text: "What time does the library open?", accepted: ["nine", "9", "9 am", "9:00"] },
        { id: "q2", text: "How many books can a student borrow?", accepted: ["five", "5"] },
        { id: "q3", text: "Where does the club meet in fine weather?", accepted: ["the garden", "garden"] },
      ] }],
  };
}

test("normalizes case, unicode width and whitespace without accepting different words", () => {
  assert.equal(normalizeAnswer("  ＮＩＮＥ  "), "nine");
  const state = readingState();
  assert.deepEqual(gradeAnswers(state.assignments[0].questions, ["  NINE ", "5", "the    garden"]).details, [true, true, true]);
  assert.equal(gradeAnswers(state.assignments[0].questions, ["nineteen", "", "garden!"]).correct, 0);
});
test("requires an exact answer count", () => {
  assert.throws(() => gradeAnswers(createDemoState().assignments[0].questions, ["nine"]));
  assert.throws(() => gradeAnswers([], []));
});
test("submission is pending until published, and re-publishing is idempotent", () => {
  const now = new Date("2026-09-23T00:00:00Z");
  const state = submitAssignment(readingState(now), "reading-library", ["nine", "5", "garden"], now, "s1");
  assert.equal(state.submissions[0].correct, 3);
  assert.equal(state.submissions[0].published, false);
  const published = publishSubmission(state, "s1");
  assert.equal(published.submissions[0].published, true);
  assert.equal(state.submissions[0].published, false);
  assert.deepEqual(publishSubmission(published, "s1"), published);
});
test("accepts a writing submission with a direct text response", () => {
  const now = new Date("2026-09-23T00:00:00Z");
  const state = {
    ...createDemoState(now),
    assignments: [{
      id: "writing-task",
      classId: "class-foundation",
      title: "Writing Task 2",
      skill: "Writing" as const,
      passage: "Discuss the benefits of learning a second language.",
      deadline: new Date(now.getTime() + 86400000).toISOString(),
      questions: [],
    }],
  };
  assert.throws(() => submitAssignment(state, "writing-task", [], now, "writing-submission"), /nhập bài viết/);
  const submitted = submitAssignment(state, "writing-task", [], now, "writing-submission", "Learning languages builds confidence.");
  assert.deepEqual(submitted.submissions[0].answers, []);
  assert.equal(submitted.submissions[0].response, "Learning languages builds confidence.");
  assert.equal(submitted.submissions[0].total, 0);
  assert.deepEqual(readDemoState(JSON.stringify(submitted)), submitted);
});
test("preserves a writing response alongside graded answers", () => {
  const now = new Date("2026-09-23T00:00:00Z");
  const submitted = submitAssignment(
    readingState(now),
    "reading-library",
    ["nine", "5", "garden"],
    now,
    "mixed-submission",
    "This response belongs to the writing section.",
  );
  assert.equal(submitted.submissions[0].response, "This response belongs to the writing section.");
  assert.deepEqual(readDemoState(JSON.stringify(submitted)), submitted);
});
test("rejects duplicates, blank answers, unknown assignments and submissions after deadline", () => {
  const now = new Date("2026-09-23T00:00:00Z");
  const state = readingState(now);
  const answers = ["nine", "5", "garden"];
  const submitted = submitAssignment(state, "reading-library", answers, now, "s1");
  assert.throws(() => submitAssignment(submitted, "reading-library", answers, now, "s2"), /đã nộp/);
  assert.throws(() => submitAssignment(state, "reading-library", [" ", "5", "garden"], now, "s1"));
  assert.throws(() => submitAssignment(state, "unknown", answers, now, "s1"));
  assert.throws(() => submitAssignment(state, "reading-library", answers, new Date("2026-10-10"), "s1"), /hết hạn/);
  assert.doesNotThrow(() => submitAssignment(state, "reading-library", answers, new Date(state.assignments[0].deadline), "s1"));
});
test("validates saved data, relationships and computed scores before loading", () => {
  const state = readingState();
  assert.deepEqual(readDemoState(JSON.stringify(state)), state);
  assert.throws(() => readDemoState('{"version":1}'));
  assert.throws(() => readDemoState(JSON.stringify({ ...state, assignments: [{ ...state.assignments[0], classId: "missing" }] })));
  const submitted = submitAssignment(state, "reading-library", ["nine", "5", "garden"], new Date(), "s1");
  assert.deepEqual(readDemoState(JSON.stringify(submitted)), submitted);
  submitted.submissions[0].correct = 100;
  assert.throws(() => readDemoState(JSON.stringify(submitted)));
});
