export class CommissionMessage {
  authorId: string;
  content: string;
  date: string = new Date().toISOString();
}
