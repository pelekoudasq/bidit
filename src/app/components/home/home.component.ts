import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	users: User[] = [];
	filterForm: FormGroup;
	currentUser: User;
	loggedin: boolean;
	auctions: Auction[] = [];
	recommendedAuctions: Auction[] = [];
	loading: boolean = false;
	recommendLoading: boolean = false;
	config: any;
	searchText: string = null;

	constructor(
		private formBuilder: FormBuilder,
		private dataService: DataService,
		private router: Router,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.config = {
			itemsPerPage: 6,
			currentPage: 1,
			totalItems: 0
		};
	}

	ngOnInit() {
		this.filterForm = this.formBuilder.group({
            region: [null],
			minprice: [null],
            maxprice: [null]			
        });
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
			// this.authenticationService.category = cat;
			// localStorage.setItem('category', cat);
			// this.router.navigate(['/searchcat']);
			this.router.navigate(['/search'], {
				queryParams: {category: cat, text: this.searchText, region: null, minprice: null, maxprice: null}
			});
		}	
	}

	onSearch() {
		console.log(this.searchText);
		
		// Navigate to the search page with extras
		this.router.navigate(['/search'], {
			queryParams: {category: null, text: this.searchText, region: null, minprice: null, maxprice: null}
		});
	}

	// convenience getter for easy access to form fields
    get f() { return this.filterForm.controls; }
	
	onSubmit() {
		// stop here if form is invalid
        if (this.filterForm.invalid) {
            return;
		}
		if(this.f.region.value == null && this.f.minprice.value == null && this.f.maxprice.value == null)
			return;
		console.log(this.filterForm);
		this.router.navigate(['/search'], {
			queryParams: {
				category: null,
				text: null,
				region: this.f.region.value, 
				minprice: this.f.minprice.value, 
				maxprice: this.f.maxprice.value
			}
		});
	}
	
	onClear() {
		this.filterForm = this.formBuilder.group({
            region: [null],
			minprice: [null],
            maxprice: [null]			
        });
	}
}
