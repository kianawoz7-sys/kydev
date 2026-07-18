import type { Faculty, StudyProgram } from "@/types/database";

export type FacultyOption = Pick<
  Faculty,
  "id" | "name" | "code"
>;

export type StudyProgramOption = Pick<
  StudyProgram,
  "id" | "faculty_id" | "name" | "degree"
>;

export type AcademicOptions = {
  faculties: FacultyOption[];
  studyPrograms: StudyProgramOption[];
};

export function formatFacultyOption(faculty: FacultyOption) {
  return `${faculty.name} (${faculty.code})`;
}

export function formatStudyProgramOption(program: StudyProgramOption) {
  return `${program.name} (${program.degree})`;
}
