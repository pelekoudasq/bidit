export class Message {
    _id: string;
    chat: string;
    sender_id: string;
    message: string;
    time: Date;
}

export class Chat {
    _id: string;
    participants: any[];
    messages: any[];
    notify: string;
    displayName: string;
}