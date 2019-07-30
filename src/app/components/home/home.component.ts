import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	users: User[] = [];
	currentUser: User;
	loggedin: boolean;

	constructor(
		private dataService: DataService,
		private router: Router) {
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		if (this.currentUser){
			this.loggedin = true;
		}
		else{
			this.loggedin = false;
		}
	
	}

	ngOnInit() {
		
	}
}
