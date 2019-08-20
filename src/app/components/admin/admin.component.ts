import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	users: User[] = [];
	auctions: Auction[] = [];
	auctionJsonUri = [];
	approvedUsers: User[] = [];
	disapprovedUsers: User[] = [];
	currentUser: User;
	loggedin: boolean;

	constructor(
		private sanitizer: DomSanitizer,
		private route: ActivatedRoute,
        private router: Router,
		private dataService: DataService,
		private alertService: AlertService) {

	}

	ngOnInit() {
		this.dataService.getAll().pipe(first()).subscribe(users => { 
			this.users = users; 
			for (var i = 0; i < this.users.length; i++) {
				if (this.users[i].approved)
					this.approvedUsers.push(this.users[i]);
				else
					this.disapprovedUsers.push(this.users[i]);
			}
		});
		this.dataService.getAuctions().pipe(first()).subscribe(auctions =>{
			this.auctions = auctions;
			for (var i = 0; i < this.auctions.length; i++) {
				var theJSON = JSON.stringify(this.auctions[i]);
				this.auctionJsonUri.push(this.sanitizer.bypassSecurityTrustUrl("data:application/json;charset=UTF-8," + encodeURIComponent(theJSON)));
			}
		});
	}	

	approve(user: User) {
		this.dataService.approveUser(user._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/admin']);
                    this.users = [];
                    this.approvedUsers = [];
                    this.disapprovedUsers = [];
                    this.auctionJsonUri = [];
                    this.ngOnInit();
                    // window.location.reload();
                },
                error => {
                    this.alertService.error("Approval denied");
                });
	}

	disapprove(user: User) {
		this.dataService.disapproveUser(user._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/admin']);
                    this.users = [];
                    this.approvedUsers = [];
                    this.disapprovedUsers = [];
                    this.auctionJsonUri = [];
                    this.ngOnInit();
                    // window.location.reload();
                },
                error => {
                    this.alertService.error("Disapproval denied");
                });
	}
}
