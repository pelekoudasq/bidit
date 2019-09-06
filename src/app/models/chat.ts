export class Message {
    _id: string;
    chat: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    read: boolean;
    time: Date;
    displayName: string;
}

export class Chat {
    _id: string;
    participants: any[];
    messages: any[];
    notify: string;
    displayName: string;
}