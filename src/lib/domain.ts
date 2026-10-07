export type Role = "teacher" | "student" | "admin";
export type Skill = "Reading" | "Listening" | "Writing" | "Speaking";
export type ClassRoom = { id: string; name: string; description: string; code: string };
export type Question = { id: string; text: string; accepted: string[] };
export type Assignment = { id: string; classId: string; title: string; skill: Skill; passage: string; deadline: string; questions: Question[] };
export type Submission = { id: string; assignmentId: string; answers: string[]; response?: string; submittedAt: string; correct: number; total: number; published: boolean };
export type DemoState = { version: 1; classes: ClassRoom[]; assignments: Assignment[]; submissions: Submission[] };

const classCodeLetters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const classCodeNumbers = "23456789";
const classCodeCharacters = classCodeLetters + classCodeNumbers;
const isClassCode = (value: string) => /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{10}$/u.test(value);

export function generateClassCode(existingCodes: Iterable<string> = []): string {
  const usedCodes = new Set([...existingCodes].map((code) => code.toUpperCase()));
  for (;;) {
    const characters = Array.from({ length: 10 }, () => classCodeCharacters[Math.floor(Math.random() * classCodeCharacters.length)]);
    characters[0] = classCodeLetters[Math.floor(Math.random() * classCodeLetters.length)];
    characters[1] = classCodeNumbers[Math.floor(Math.random() * classCodeNumbers.length)];
    for (let index = characters.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
    }
    const code = characters.join("");
    if (!usedCodes.has(code)) return code;
  }
}

export function normalizeClassCodes(state: DemoState): DemoState {
  const usedCodes = new Set<string>();
  let changed = false;
  const classes = state.classes.map((classroom) => {
    const normalizedCode = classroom.code.toUpperCase();
    if (isClassCode(normalizedCode) && !usedCodes.has(normalizedCode)) {
      usedCodes.add(normalizedCode);
      if (normalizedCode !== classroom.code) { changed = true; return { ...classroom, code: normalizedCode }; }
      return classroom;
    }
    const code = generateClassCode(usedCodes);
    usedCodes.add(code);
    changed = true;
    return { ...classroom, code };
  });
  return changed ? { ...state, classes } : state;
}

export function normalizeAnswer(answer: string): string {
  return answer.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US");
}

export function gradeAnswers(questions: Question[], answers: string[]) {
  if (questions.length === 0) throw new Error("Bài tập phải có ít nhất một câu hỏi.");
  if (answers.length !== questions.length) throw new Error("Số câu trả lời không khớp với đề bài.");
  const details = questions.map((question, index) => {
    const answer = normalizeAnswer(answers[index]);
    return answer.length > 0 && question.accepted.some((value) => normalizeAnswer(value) === answer);
  });
  return { correct: details.filter(Boolean).length, total: questions.length, details };
}

export function submitAssignment(state: DemoState, assignmentId: string, answers: string[], now: Date, id: string, response = "", allowIncomplete = false): DemoState {
  const assignment = state.assignments.find((item) => item.id === assignmentId);
  if (!assignment) throw new Error("Không tìm thấy bài tập.");
  if (!Number.isFinite(now.getTime()) || now.getTime() > new Date(assignment.deadline).getTime()) throw new Error("Đã hết hạn nộp bài.");
  if (state.submissions.some((item) => item.assignmentId === assignmentId)) throw new Error("Bạn đã nộp bài này. Bản thử nghiệm hỗ trợ một lần nộp.");
  if (assignment.questions.length === 0) {
    const writing = response.trim();
    if (assignment.skill === "Writing" && !writing && !allowIncomplete) throw new Error("Vui lòng nhập bài viết trước khi nộp.");
    return {
      ...state,
      submissions: [...state.submissions, {
        id,
        assignmentId,
        answers: [],
        ...(writing || (allowIncomplete && assignment.skill === "Writing") ? { response: writing || " " } : {}),
        submittedAt: now.toISOString(),
        correct: 0,
        total: 0,
        published: false,
      }],
    };
  }
  if (answers.some((item) => !item.trim()) && !allowIncomplete) throw new Error("Vui lòng trả lời tất cả câu hỏi trước khi nộp.");
  const { correct, total } = gradeAnswers(assignment.questions, answers);
  const writing = response.trim();
  return { ...state, submissions: [...state.submissions, { id, assignmentId, answers, ...(writing ? { response: writing } : {}), submittedAt: now.toISOString(), correct, total, published: false }] };
}

export function publishSubmission(state: DemoState, submissionId: string): DemoState {
  if (!state.submissions.some((item) => item.id === submissionId)) throw new Error("Không tìm thấy bài nộp.");
  return { ...state, submissions: state.submissions.map((item) => item.id === submissionId ? { ...item, published: true } : item) };
}

export function createDemoState(now = new Date()): DemoState {
  return {
    version: 1,
    classes: [{ id: "class-foundation", name: "IELTS Foundation", description: "Lớp mẫu để kiểm tra quy trình giao và nộp bài.", code: generateClassCode() }],
    assignments: [],
    submissions: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const isText = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const isDate = (value: unknown): value is string => isText(value) && Number.isFinite(Date.parse(value));

export function readDemoState(raw: string): DemoState {
  const fail = () => { throw new Error("Dữ liệu mẫu đã lưu không hợp lệ. Bạn có thể đặt lại dữ liệu mẫu."); };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return fail(); }
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.classes) || !Array.isArray(value.assignments) || !Array.isArray(value.submissions)) return fail();
  if (!value.classes.every((item: unknown) => isRecord(item) && [item.id, item.name, item.code].every(isText) && typeof item.description === "string")) return fail();
  const classIds = new Set(value.classes.map((item: ClassRoom) => item.id));
  if (classIds.size !== value.classes.length) return fail();
  if (!value.assignments.every((item: unknown) => {
    if (!isRecord(item) || !isText(item.id) || !classIds.has(item.classId as string) || !isText(item.title) || !["Reading", "Listening", "Writing", "Speaking"].includes(item.skill as string) || typeof item.passage !== "string" || !isDate(item.deadline) || !Array.isArray(item.questions)) return false;
    if (item.skill === "Writing" || item.skill === "Speaking") return item.questions.length === 0;
    return item.questions.length > 0 && item.questions.every((q: unknown) => isRecord(q) && isText(q.id) && isText(q.text) && Array.isArray(q.accepted) && q.accepted.length > 0 && q.accepted.every(isText));
  })) return fail();
  const assignments = value.assignments as Assignment[];
  if (new Set(assignments.map((item) => item.id)).size !== assignments.length) return fail();
  const submissionIds = new Set<string>();
  const submittedAssignments = new Set<string>();
  if (!value.submissions.every((item: unknown) => {
    if (!isRecord(item) || !isText(item.id) || !isText(item.assignmentId) || !isDate(item.submittedAt) || typeof item.published !== "boolean" || !Array.isArray(item.answers) || !item.answers.every(isText) || (typeof item.response !== "undefined" && typeof item.response !== "string")) return false;
    const assignment = assignments.find((assignment) => assignment.id === item.assignmentId);
    if (!assignment || item.answers.length !== assignment.questions.length || submissionIds.has(item.id) || submittedAssignments.has(item.assignmentId)) return false;
    submissionIds.add(item.id); submittedAssignments.add(item.assignmentId);
    if (assignment.questions.length === 0) return item.correct === 0 && item.total === 0 && (assignment.skill !== "Writing" || isText(item.response));
    const grade = gradeAnswers(assignment.questions, item.answers as string[]);
    return grade.correct === item.correct && grade.total === item.total;
  })) return fail();
  return value as DemoState;
}
