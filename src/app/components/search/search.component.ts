import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';
import { Category } from '../../models/category';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

	filter: string;
	filterForm: FormGroup;
	currentUser: User;
    auctions: Auction[] = [];
	loading: boolean = false;
	config: any;
	cat: Category;
	category: string = null;
	searchText: string = null;
	region: string = null;
	minprice: number;
	maxprice: number;
	params: any;
    
    constructor(
		private formBuilder: FormBuilder,
        private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
        private authenticationService: AuthenticationService,
        private sanitizer: DomSanitizer
    ) { 
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.config = {
			itemsPerPage: 6,
			currentPage: 1,
			totalItems: 0
		};
    }

    ngOnInit() {
		this.auctions = [];
		this.loading = false;
		this.route.queryParams.subscribe(params => {
			this.category = params.category;
			this.searchText = params.text;
			this.region = params.region;
			this.minprice = params.minprice;
			this.maxprice = params.maxprice;
			this.filterForm = this.formBuilder.group({
				region: [params.region],
				minprice: [params.minprice],
				maxprice: [params.maxprice]		
			});

			this.dataService.getFilterAuctions(params).pipe(first()).subscribe(auctions => {
				this.auctions = auctions;
				this.config.totalItems = auctions.length;
				if (this.category) {
					this.dataService.getCategory(this.category).pipe(first()).subscribe(cat => {
						this.cat = cat;
						this.loading = true;
					});
				}
				else {
					this.loading = true;
				}
				this.filter = this.searchText;		
				
			});
			
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
			this.loading = false;
			this.router.navigate(['/search'], {
				queryParams: {
					category: cat
				},
				queryParamsHandling: "merge"
			});
		}	
	}
	
	onClearCat() {
		this.loading = false;
		this.router.navigate(['/search'], {
			queryParams: { 
				category: null
			}, 
			queryParamsHandling: "merge"
		});
	}
    
    onSearch() {
		this.loading = false;
		if (this.searchText == "")
			this.searchText = null;
		this.router.navigate(['/search'], {
			queryParams: { 
				text: this.searchText
			}, 
			queryParamsHandling: "merge"
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
		this.loading = false;
		this.router.navigate(['/search'], {
			queryParams: {
				region: this.f.region.value, 
				minprice: this.f.minprice.value, 
				maxprice: this.f.maxprice.value
			},
			queryParamsHandling: "merge"
		});
	}
	
	onClear() {
		this.loading = false;
		this.filterForm = this.formBuilder.group({
            region: [null],
			minprice: [null],
            maxprice: [null]			
		});
		this.router.navigate(['/search'], {
			queryParams: { category: this.category, text: this.searchText}
		});
	}
}
