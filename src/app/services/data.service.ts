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
        // this.address = "83.212.108.244";
        this.address = "localhost";
    }

    getAll() {
        return this.http.get<User[]>(`http://${this.address}:3000/api/users`);
    }

    getUserAuctions(id: string) {
        return this.http.get<Auction[]>(`http://${this.address}:3000/api/auctions/` + id);
    }

    getAuctions() {
        return this.http.get<Auction[]>(`http://${this.address}:3000/api/auctions`);
    }

    getCatAuctions(cat: string) {
        return this.http.get<Auction[]>(`http://${this.address}:3000/api/auctionscat/`+ cat);
    }

    getAuction(id: string) {
        return this.http.get<Auction>(`http://${this.address}:3000/api/auction/` + id);
    }

    getBid(id: string) {
        return this.http.get<Bid>(`http://${this.address}:3000/api/bid/` + id);
    }

    getUserBids(id: string) {
        return this.http.get<Bid[]>(`http://${this.address}:3000/api/bids/` + id);
    }

    approveUser(id: string) {
        return this.http.get(`http://${this.address}:3000/api/users/approve/` + id);
    }

    disapproveUser(id: string) {
        return this.http.get(`http://${this.address}:3000/api/users/disapprove/` + id);
    }

    getById(id: string) {
        return this.http.get<User>(`http://${this.address}:3000/api/user/` + id);
    }

    register(user: User) {
        return this.http.post(`http://${this.address}:3000/api/users/register`, user);
    }

    addAuction(auction: Auction, userid: string) {
        return this.http.post(`http://${this.address}:3000/api/newauction/`, { userid: userid, auction: auction });
    }

    startAuction(id: string, enddate: Date) {
        return this.http.post(`http://${this.address}:3000/api/startauction/`, { auctionid: id, enddate: enddate });
    }

    updateUser(user: User, userid: string) {
        return this.http.post(`http://${this.address}:3000/api/userupdate/`, { userid: userid, user: user });
    }

    updateAuction(auction: Auction, auctionid: string) {
        return this.http.post(`http://${this.address}:3000/api/auctionupdate/`, { auction: auction, auctionid: auctionid });   
    }

    deleteAuction(id: string) {
        return this.http.delete(`http://${this.address}:3000/api/auctiondelete/`+ id);
    }

    addBid(id: string, price: number, userid: string) {
        return this.http.post(`http://${this.address}:3000/api/addbid/`, { auctionid: id, price: price, userid: userid }); 
    }

    getChatWithUser(id: string, userid: string) {
        return this.http.post<Chat>(`http://${this.address}:3000/api/getchat/`, { participant1id: id, participant2id: userid }); 
    }

    sendMessage(message: string, chatid: string, userid: string, receiver: string) {
        return this.http.post<Chat>(`http://${this.address}:3000/api/sendmessage/`, { message: message, chat: chatid, sender: userid, receiver: receiver });
    }

    getMessage(id: string) {
        return this.http.get<Message>(`http://${this.address}:3000/api/message/` + id);
    }

    getChat(id: string) {
        return this.http.get<Chat>(`http://${this.address}:3000/api/chat/` + id);
    }

    notifiedChat(id: string) {
        return this.http.get<Chat>(`http://${this.address}:3000/api/chatnotified/` + id);
    }

    getUserMessages(id: string) {
        return this.http.get<Chat[]>(`http://${this.address}:3000/api/messages/` + id);
    }

    getCategories() {
        return this.http.get<Category[]>(`http://${this.address}:3000/api/categories`);
    }

    getCategory(name: string) {
        return this.http.get<Category>(`http://${this.address}:3000/api/category/` + name);
    }
}
