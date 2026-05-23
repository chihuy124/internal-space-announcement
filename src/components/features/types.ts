export type FeatureItem = {
  id: string;
  ticket: string | null;
  ticketName: string;
  assignee: string;
  releaseDate: string;
  userGuide: string;
  createdAt: string;
  updatedAt: string;
};

export type MemberItem = {
  id: string;
  hasPassword?: boolean;
  name: string;
  username: string;
};
