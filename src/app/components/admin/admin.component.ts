import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	users: User[] = [];
	currentUser: User;
	loggedin: boolean;

	constructor(private dataService: DataService) {

	}

	ngOnInit() {
		this.dataService.getAll().pipe(first()).subscribe(users => { 
			this.users = users; 
			console.log(this.users);
		});
		console.log(this.currentUser);
	}

	approve() {
		console.log("approve clicked");
	}

	disapprove() {
		console.log("disapprove clicked");
	}
}
