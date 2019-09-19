import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models/user';
import { Auction, Bid } from '../models/auction';
import { Chat, Message } from '../models/chat';
import { Category } from '../models/category';

@Injectable()
export class DataService {
  
    address: string;
  
    constructor(private http: HttpClient) {
        this.address = "localhost";
        // this.address = "83.212.108.244";
    }

    getAll() {
        return this.http.get<User[]>(`https://${this.address}:3000/api/users`);
    }

    getUserAuctions(id: string) {
        return this.http.get<Auction[]>(`https://${this.address}:3000/api/auctions/` + id);
    }

    getAuctions() {
        return this.http.get<Auction[]>(`https://${this.address}:3000/api/auctions`);
    }

    getActiveAuctions() {
        return this.http.get<Auction[]>(`https://${this.address}:3000/api/activeauctions`);
    }

    getCatAuctions(cat: string) {
        return this.http.get<Auction[]>(`https://${this.address}:3000/api/auctionscat/`+ cat);
    }

    getTextAuctions(text: string) {
        return this.http.get<Auction[]>(`https://${this.address}:3000/api/auctionstext/`+ text);        
    }

    getFilterAuctions( params: any) {
        return this.http.post<Auction[]>(`https://${this.address}:3000/api/auctionsfilter/`, { params: params} );                
    }

    getAuction(id: string) {
        return this.http.get<Auction>(`https://${this.address}:3000/api/auction/` + id);
    }

    auctionVisit(auctionid: string, id: string) {
        return this.http.post<any>(`https://${this.address}:3000/api/auctionvisit/`, { auctionid: auctionid, userid: id });
    }

    getBid(id: string) {
        return this.http.get<Bid>(`https://${this.address}:3000/api/bid/` + id);
    }

    getUserBids(id: string) {
        return this.http.get<Bid[]>(`https://${this.address}:3000/api/bids/` + id);
    }

    approveUser(id: string) {
        return this.http.get(`https://${this.address}:3000/api/users/approve/` + id);
    }

    disapproveUser(id: string) {
        return this.http.get(`https://${this.address}:3000/api/users/disapprove/` + id);
    }

    getById(id: string) {
        return this.http.get<User>(`https://${this.address}:3000/api/user/` + id);
    }

    register(user: User) {
        return this.http.post(`https://${this.address}:3000/api/users/register`, user);
    }

    addAuction(auction: Auction, userid: string) {
        return this.http.post(`https://${this.address}:3000/api/newauction/`, { userid: userid, auction: auction });
    }

    startAuction(id: string, enddate: Date) {
        return this.http.post(`https://${this.address}:3000/api/startauction/`, { auctionid: id, enddate: enddate });
    }

    updateUser(user: User, userid: string) {
        return this.http.post(`https://${this.address}:3000/api/userupdate/`, { userid: userid, user: user });
    }

    updateAuction(auction: Auction, auctionid: string) {
        return this.http.post(`https://${this.address}:3000/api/auctionupdate/`, { auction: auction, auctionid: auctionid });   
    }

    deleteAuction(id: string) {
        return this.http.delete(`https://${this.address}:3000/api/auctiondelete/`+ id);
    }

    addBid(id: string, price: number, userid: string) {
        return this.http.post(`https://${this.address}:3000/api/addbid/`, { auctionid: id, price: price, userid: userid }); 
    }

    getChatWithUser(id: string, userid: string) {
        return this.http.post<Chat>(`https://${this.address}:3000/api/getchat/`, { participant1id: id, participant2id: userid }); 
    }

    sendMessage(message: string, chatid: string, userid: string, receiver: string) {
        return this.http.post<Chat>(`https://${this.address}:3000/api/sendmessage/`, { message: message, chat: chatid, sender: userid, receiver: receiver });
    }

    deleteMessage(id: string) {
        return this.http.delete(`https://${this.address}:3000/api/messagedelete/`+ id);
    }

    getMessage(id: string, userid: string) {
        return this.http.post<Message>(`https://${this.address}:3000/api/message/`, { message_id: id, open_id: userid });
    }

    getChat(id: string) {
        return this.http.get<Chat>(`https://${this.address}:3000/api/chat/` + id);
    }

    notifiedChat(id: string) {
        return this.http.get<Chat>(`https://${this.address}:3000/api/chatnotified/` + id);
    }

    getUserMessages(id: string) {
        return this.http.get<Chat[]>(`https://${this.address}:3000/api/messages/` + id);
    }

    getUserInbox(id: string) {
        return this.http.get<Message[]>(`https://${this.address}:3000/api/inbox/` + id);
    }

    getUserSent(id: string) {
        return this.http.get<Message[]>(`https://${this.address}:3000/api/sent/` + id);
    }

    getCategories() {
        return this.http.get<Category[]>(`https://${this.address}:3000/api/categories`);
    }

    getCategory(name: string) {
        return this.http.get<Category>(`https://${this.address}:3000/api/category/` + name);
    }

    closeAuction(id: string) {
        return this.http.get<Auction>(`https://${this.address}:3000/api/closeauction/` + id);
    }

    getNotifications(id: string) {
        return this.http.get<any>(`https://${this.address}:3000/api/notifications/` + id);
    }

    getTopActiveAuctions() {
        return this.http.get<Auction[]>(`https://${this.address}:3000/api/topauctions`);
    }
}
