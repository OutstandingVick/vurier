export type NotificationMessage = { userId: string; subject: string; body: string; actionUrl?: string };

export interface Notifier {
  send(message: NotificationMessage): Promise<void>;
}
