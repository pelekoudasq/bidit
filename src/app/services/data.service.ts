import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../../models/user';

@Injectable()
export class DataService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`http://localhost:3000/api/users`);
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