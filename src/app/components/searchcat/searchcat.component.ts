import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';
import { Category } from '../../models/category';

@Component({
	selector: 'app-searchcat',
	templateUrl: './searchcat.component.html',
	styleUrls: ['./searchcat.component.css']
})
export class SearchCatComponent implements OnInit {

	users: User[] = [];
	category: Category;
	currentUser: User;
	loggedin: boolean;
	auctions: Auction[] = [];
	loading: boolean = false;
	config: any;
  
  	constructor(
		private dataService: DataService,
		private router: Router,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer) {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.config = {
			itemsPerPage: 15,
			currentPage: 1,
			totalItems: 0
		};
	}

	   
	pageChanged(event){
		this.config.currentPage = event;
	}

	transform(i: string) {
		let obj = this.auctions.find(o => o._id === i);
		return this.sanitizer.bypassSecurityTrustResourceUrl(obj.photos[0].url);
	}

	ngOnInit() {
		this.loading = false;
		this.auctions = [];
		if (this.authenticationService.category) {
			this.dataService.getCategory(this.authenticationService.category).pipe(first()).subscribe(cat => {
				this.category = cat;
				this.dataService.getCatAuctions(this.category.name).pipe(first()).subscribe(auctions => {
					for (var i = auctions.length - 1; i >= 0; i--) {
						if (auctions[i].started) 
							this.auctions.push(auctions[i]);
					}
					this.config.totalItems = auctions.length;			
					this.loading = true;
				});
			});
			
		}
		else 
			this.router.navigate(['/home']);
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
			this.ngOnInit();
		}	
	}
}
