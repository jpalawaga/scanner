export type Interaction = {
  id: string;
  companyName: string;
  participants: string[];
  date: string;
  meetingSet: boolean;
};

export const interactions: Interaction[] = [];
