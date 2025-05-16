import { Declaration } from "./declaration";
import { User } from "./User.model";

export class Notification {
    id: number;
    createdAt: string;
    isRead: boolean;
    message: string;
    type: string;
    utilisateur: User;
    declaration: Declaration;
  }