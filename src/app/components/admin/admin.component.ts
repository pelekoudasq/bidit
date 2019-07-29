import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

	constructor(
		private route: ActivatedRoute,
        private router: Router,
		private dataService: DataService,
		private alertService: AlertService) {

	}

	ngOnInit() {
		this.dataService.getAll().pipe(first()).subscribe(users => { 
			this.users = users; 
			console.log(this.users);
		});
		console.log(this.currentUser);
	}

	approve(user: User) {
		console.log("approve clicked" + user._id);
		this.dataService.approveUser(user._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/admin']);
                    window.location.reload();
                },
                error => {
                    this.alertService.error("Approval denied");
                });
	}

	disapprove(user: User) {
		console.log("disapprove clicked");
		this.dataService.disapproveUser(user._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/admin']);
                    window.location.reload();
                },
                error => {
                    this.alertService.error("Disapproval denied");
                });
	}
}
