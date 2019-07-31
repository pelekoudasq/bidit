import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../../models/user';
import { Auction, Bid } from '../models/auction';

@Injectable()
export class DataService {
    constructor(private http: HttpClient) { }

    getAll() {
    	console.log("get all users");
        return this.http.get<User[]>(`http://localhost:3000/api/users`);
    }

    getUserAuctions(id: string) {
        return this.http.get<Auction[]>(`http://localhost:3000/api/auctions/` + id);
    }

    getAuctions() {
        return this.http.get<Auction[]>(`http://localhost:3000/api/auctions`);
    }

    getAuction(id: string) {
        return this.http.get<Auction>(`http://localhost:3000/api/auction/` + id);
    }

    getBid(id: string) {
        return this.http.get<Bid>(`http://localhost:3000/api/bid/` + id);
    }

    getUserBids(id: string) {
        return this.http.get<Bid[]>(`http://localhost:3000/api/bids/` + id);
    }

    approveUser(id: string) {
        return this.http.get(`http://localhost:3000/api/users/approve/` + id);
    }

    disapproveUser(id: string) {
        return this.http.get(`http://localhost:3000/api/users/disapprove/` + id);
    }

    getById(id: number) {
        return this.http.get(`http://localhost:3000/api/users/` + id);
    }

    register(user: User) {
        return this.http.post(`http://localhost:3000/api/users/register`, user);
    }

    update(user: User) {
        return this.http.put(`http://localhost:3000/api/users/` + user.id, user);
    }

    delete(id: number) {
        return this.http.delete(`http://localhost:3000/api/users/` + id);
    }
}
