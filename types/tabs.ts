export interface Tab {
  id: number;
  title: string;
  instructions: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TabFormData {
  title: string;
  instructions: string;
  code: string;
}

export type TabAction = 'add' | 'edit' | 'delete';

export interface TabActionParams {
  action: TabAction;
  id?: string;
  title?: string;
  instructions?: string;
  code?: string;
}