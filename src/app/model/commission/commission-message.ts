export class CommissionMessage {
    authorId: number;
    content: string;
    date: string = new Date().toISOString();
}
