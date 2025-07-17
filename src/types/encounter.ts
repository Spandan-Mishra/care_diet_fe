import type { PatientRead } from "./patient";

export interface Encounter {
  id: string;
  patient: string | PatientRead;
} 