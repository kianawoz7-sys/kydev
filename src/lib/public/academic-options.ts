import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import {
  type AcademicOptions,
  formatFacultyOption,
  formatStudyProgramOption,
} from "@/lib/academic-options";
import type { FormConfig } from "@/lib/form-config";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const facultySelect = "id, name, code";
const studyProgramSelect = "id, faculty_id, name, degree";

export const getPublicAcademicOptions = cache(
  async (): Promise<AcademicOptions> => {
    const supabase = await createClient();
    const [faculties, studyPrograms] = await Promise.all([
      supabase
        .from("faculties")
        .select(facultySelect)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("study_programs")
        .select(studyProgramSelect)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    if (faculties.error || studyPrograms.error) {
      throw new Error("Pilihan fakultas dan program studi belum dapat dimuat.");
    }

    return {
      faculties: faculties.data ?? [],
      studyPrograms: studyPrograms.data ?? [],
    };
  },
);

type AcademicSelectionResult =
  | { success: true; faculty: string | null; major: string | null }
  | { success: false; message: string };

function numericId(value: string) {
  if (!/^[1-9][0-9]*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export async function resolveOrderAcademicSelection(
  supabase: SupabaseClient<Database>,
  config: FormConfig,
  input: { facultyId: string; studyProgramId: string },
): Promise<AcademicSelectionResult> {
  const facultyVisible = config.faculty.status !== "hidden";
  const majorVisible = config.major.status !== "hidden";
  const facultyValue = facultyVisible ? input.facultyId.trim() : "";
  const majorValue = majorVisible ? input.studyProgramId.trim() : "";

  if (!facultyVisible && !majorVisible) {
    return { success: true, faculty: null, major: null };
  }

  if (facultyVisible && config.faculty.status === "required" && !facultyValue) {
    return { success: false, message: "Pilih fakultas terlebih dahulu." };
  }

  if (majorVisible && config.major.status === "required" && !majorValue) {
    return {
      success: false,
      message:
        facultyVisible && !facultyValue
          ? "Pilih fakultas terlebih dahulu."
          : "Pilih program studi.",
    };
  }

  if (majorValue && facultyVisible && !facultyValue) {
    return { success: false, message: "Pilih fakultas terlebih dahulu." };
  }

  const facultyId = facultyValue ? numericId(facultyValue) : null;
  const studyProgramId = majorValue ? numericId(majorValue) : null;

  if ((facultyValue && !facultyId) || (majorValue && !studyProgramId)) {
    return {
      success: false,
      message: "Pilihan fakultas atau program studi tidak tersedia.",
    };
  }

  const [facultyResult, programResult] = await Promise.all([
    facultyId
      ? supabase
          .from("faculties")
          .select(facultySelect)
          .eq("id", facultyId)
          .eq("is_active", true)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    studyProgramId
      ? supabase
          .from("study_programs")
          .select(studyProgramSelect)
          .eq("id", studyProgramId)
          .eq("is_active", true)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (facultyResult.error || programResult.error) {
    return {
      success: false,
      message: "Pilihan fakultas atau program studi belum dapat diperiksa.",
    };
  }

  if ((facultyId && !facultyResult.data) || (studyProgramId && !programResult.data)) {
    return {
      success: false,
      message: "Pilihan fakultas atau program studi tidak tersedia.",
    };
  }

  const program = programResult.data;
  if (
    facultyResult.data &&
    program &&
    program.faculty_id !== facultyResult.data.id
  ) {
    return {
      success: false,
      message: "Program studi tidak sesuai dengan fakultas yang dipilih.",
    };
  }

  let faculty = facultyResult.data;
  if (!facultyVisible && program) {
    const derivedFaculty = await supabase
      .from("faculties")
      .select(facultySelect)
      .eq("id", program.faculty_id)
      .eq("is_active", true)
      .maybeSingle();

    if (derivedFaculty.error || !derivedFaculty.data) {
      return {
        success: false,
        message: "Pilihan fakultas atau program studi tidak tersedia.",
      };
    }

    faculty = derivedFaculty.data;
  }

  return {
    success: true,
    faculty: faculty ? formatFacultyOption(faculty) : null,
    major: program ? formatStudyProgramOption(program) : null,
  };
}
