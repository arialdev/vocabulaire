import {TagOptions} from './tag-options';

export interface Tag {
  id: number;
  name: string;
  icon: string;
  options: TagOptions;
  status: boolean;
  createdAt: number;
  updatedAt: number;
}
