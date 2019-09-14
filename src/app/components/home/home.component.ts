import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	users: User[] = [];
	currentUser: User;
	loggedin: boolean;
	auctions: Auction[] = [];
	recommendedAuctions: Auction[] = [];
	loading: boolean = false;
	recommendLoading: boolean = false;
	config: any;
	searchText: string = "";

	constructor(
		private dataService: DataService,
		private router: Router,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.config = {
			itemsPerPage: 3,
			currentPage: 1,
			totalItems: 0
		};
	}

	ngOnInit() {
		this.dataService.getActiveAuctions().pipe(first()).subscribe(auctions => {
			this.auctions = auctions;
			this.config.totalItems = auctions.length;
			this.loading = true;
		});
		if (!this.currentUser) {
			this.dataService.getTopActiveAuctions().pipe(first()).subscribe(auctions => {
				this.recommendedAuctions = auctions;
				this.recommendLoading = true;
			});
		}
	}

	pageChanged(event){
		this.config.currentPage = event;
	}

	transform(i: string) {
		let obj = this.auctions.find(o => o._id === i);
		return this.sanitizer.bypassSecurityTrustResourceUrl(obj.photos[0].url);
	}

	transformRec(i: string) {
		let obj = this.recommendedAuctions.find(o => o._id === i);
		return this.sanitizer.bypassSecurityTrustResourceUrl(obj.photos[0].url);
	}

	onNameClick(id: string) {
		if (id)
			this.router.navigate(['/auction', id]);
	}

	onCatClick(cat: string) {
		if (cat) {
			console.log(cat);
			this.authenticationService.category = cat;
			localStorage.setItem('category', cat);
			this.router.navigate(['/searchcat']);
		}	
	}

	onSearch() {
		console.log(this.searchText);
		
		// Navigate to the login page with extras
		// this.router.navigate(['/search', {text: this.searchText, region: "", minprice: null, maxprice: null}]);
		this.router.navigate(['/search'], {
			queryParams: {text: this.searchText, region: null, minprice: null, maxprice: null}
		});
	}
}
