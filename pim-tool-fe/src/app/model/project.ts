import { Group } from './group';

export enum Status {
  NEW = 'NEW',
  PLA = 'PLA',
  INP = 'INP',
  FIN = 'FIN',
}

export interface Project {
  id: number;
  number: number;
  name: string;
  customer: string;
  group: Group;
  groupId: number;
  groupLeaderVisa: string;
  members: [];
  status: Status;
  startDate: Date;
  endDate: Date;
  version: number;
}
