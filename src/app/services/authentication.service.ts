import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { DataService } from './data.service';

import { User } from '../models/user';
import { Category } from '../models/category';
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
    public categories: Category[] = [];
	public main: Category[] = [];
    public username: string;

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
        this.dataService.getCategories().pipe(first()).subscribe(cats => {
			this.categories = cats;
			cats.forEach(cat => {
				if(cat.path == null)
					this.main.push(cat);
			});
		});
        
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
        return this.http.post<any>(`https://localhost:3000/api/users/authenticate`, { username: username, password: password })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                this.loggedin = true;
                this.isAdmin = user.admin;
                this.approved = user.approved;
                this.username = user.username;
                this.dataService.getNotifications(user._id).subscribe(notifications => {
                    this.notifications = notifications;
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
