import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataService } from './data.service';

import { User } from '../models/user';
import { Auction } from '../models/auction';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private user: User;
    public loggedin: boolean;
    public isAdmin: boolean;
    public approved: boolean;
    public auctionE: string = "";
    public category: string = "";
    public inAuction: boolean;
    public notifications: number = 0;

    constructor(private http: HttpClient,
                private dataService: DataService,
                private router: Router)
    {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.loggedin = false;
        this.isAdmin = false;
        this.inAuction = false;
        this.currentUser.subscribe(x => this.user = x);
        this.category = localStorage.getItem('category');
        
        if (this.user){
            this.loggedin = true;
            this.isAdmin = this.user.admin;
            this.approved = this.user.approved;
        }
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`http://localhost:3000/api/users/authenticate`, { username: username, password: password })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                this.loggedin = true;
                this.isAdmin = user.admin;
                this.approved = user.approved;
                this.dataService.getUserMessages(user._id).subscribe(chats => {
                    this.notifications = 0;
                    for (var i = chats.length - 1; i >= 0; i--) {
                        if (chats[i].notify == user._id)
                            this.notifications++;
                    }
                });
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.loggedin = false;
        this.isAdmin = false;
        this.approved = false;
    }
}
