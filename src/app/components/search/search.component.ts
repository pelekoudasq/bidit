import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    filter: string;
	currentUser: User;
    auctions: Auction[] = [];
	loading: boolean = false;
    config: any;
	searchText: string = "";
	region: string = "";
	minprice: number;
	maxprice: number;
	params: any;
    
    constructor(
        private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
        private authenticationService: AuthenticationService,
        private sanitizer: DomSanitizer
    ) { 
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.config = {
			itemsPerPage: 15,
			currentPage: 1,
			totalItems: 0
		};
    }

    ngOnInit() {
		this.auctions = [];
		this.loading = false;
		this.route.queryParams.subscribe( (params) => {
			this.searchText = params.text;
			this.region = params.region;
			this.minprice = params.minprice;
			this.maxprice = params.maxprice;

			if(this.searchText != null){
				this.dataService.getTextAuctions(this.searchText).pipe(first()).subscribe(auctions => {
					this.auctions = auctions;
					this.config.totalItems = auctions.length;
					this.filter = this.searchText;		
					this.loading = true;
				});
			}
			else if(this.region != null){
				console.log("region search");
				this.filter = this.region;
				// cnt'd
			}
			
		});		
    }

    pageChanged(event){
		this.config.currentPage = event;
	}

	transform(i: string) {
		let obj = this.auctions.find(o => o._id === i);
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
			this.ngOnInit();
		}	
    }
    
    onSearch() {
		console.log(this.searchText+"0");
		// console.log(this.route.queryParams.);

		this.router.navigate(['/search'], {queryParams: { text: this.searchText }});
		this.loading = false;
	}

}
