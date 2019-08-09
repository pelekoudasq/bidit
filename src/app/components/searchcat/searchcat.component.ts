import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
	selector: 'app-searchcat',
	templateUrl: './searchcat.component.html',
	styleUrls: ['./searchcat.component.css']
})
export class SearchCatComponent implements OnInit {

	users: User[] = [];
	category: string = "";
	currentUser: User;
	loggedin: boolean;
	auctions: Auction[] = [];
	loading: boolean = false;
	ctgrs: any[] = [
        {
            name: 'Clothing',
            sub: [
                {value: 'men-0', viewValue: 'Men'},
                {value: 'women-1', viewValue: 'Women'},
                {value: 'kids-2', viewValue: 'Kids'},
                {value: 'shoes-3', viewValue: 'Shoes'}
            ]
        },
        {
            name: 'Toys',
            sub: [
                {value: 'infants-0', viewValue: 'Infants'},
                {value: 'toddlers-1', viewValue: 'Toddlers'},
                {value: '3-6-years-2', viewValue: '3-6 Years old'},
                {value: '6-9-years-3', viewValue: '6-9 Years old'}
            ]
        },
        {
            name: 'Electronics',
            sub: [
                {value: 'phone-0', viewValue: 'Phone'},
                {value: 'laptop-1', viewValue: 'Laptop'},
                {value: 'tv-2', viewValue: 'TV'},
                {value: 'pc-3', viewValue: 'PC'}
            ]
        }
    ];
  
  	constructor(
		private dataService: DataService,
		private router: Router,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer) { 
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	
	}

	transform(i: number) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(this.auctions[i].image);
	}

	ngOnInit() {
		this.category = this.authenticationService.category;
		if (this.category)
			this.dataService.getCatAuctions(this.category).pipe(first()).subscribe(auctions => {
				this.auctions = auctions;
				this.loading = true;
			});
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
			localStorage.setItem('category', cat);
			location.reload();
		}	
	}
}
