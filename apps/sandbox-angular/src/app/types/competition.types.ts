export interface CompetitionStructure {
  id: string;
  name: string;
  layout: string;
  slug: string;
  fullSlug: string;
  position: number | null;
  executionStatus: Status;
  phases: Phase[];
  children: CompetitionStructure[];
  tournaments: Tournament[];
}

export interface Tournament {
  id: string;
  mode: string;
  phaseId: null | string;
  status: Status;
}

export interface Phase {
  id: string;
  name: string;
  position: number;
  executionStatus: Status;
  stageId: string;
}

export enum Status {
  Completed = 'completed',
  Running = 'running',
  Upcoming = 'upcoming',
}
