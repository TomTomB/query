import { ggQuery } from './query.core';
import { GetCompetitionStructureQuery } from './types';
import { CompetitionStructure } from '../types';

export const getCompetitionStructure = ggQuery.create<
  CompetitionStructure,
  GetCompetitionStructureQuery
>({
  route: (p) => `/public/competition-stage/${p.id}/structure`,
  method: 'GET',
});
