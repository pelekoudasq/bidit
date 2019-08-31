import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';


import { User } from '../../models/user';
import { Auction, Bid } from '../../models/auction';

@Component({
	selector: 'app-auction',
	templateUrl: './auction.component.html',
	styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit {

	@Input()
    url: SafeResourceUrl;

	requestedAuction: string;
	bidForm: FormGroup;	
	auction: Auction;
	bids: Bid[] = [];
	currentUser: User;
	loading: boolean = false;
	seller: User;
	editA: boolean = false;
	bidClicked: boolean = false;
	completed: boolean = false;
	longitude: number = null;
	latitude: number = null;
	mapsrc: string;
	mapok: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer,
		private alertService: AlertService)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	transform() {
		return this.sanitizer.bypassSecurityTrustResourceUrl(this.auction.image);
	}

	

	ngOnInit() {		
		this.requestedAuction = this.route.snapshot.params.id;		
		this.authenticationService.inAuction = true;

		this.dataService.getAuction(this.requestedAuction).pipe(first()).subscribe(auction => {

			this.auction = auction;
			this.longitude = auction.location.latitude;
			this.latitude = auction.location.longitude;
			if(this.latitude != null && this.longitude != null)
				this.mapok = true;
			this.mapsrc = "http://83.212.102.165:4200/?lat="+this.latitude+"&long="+this.longitude;		
			this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.mapsrc);
			
			var today = new Date();
			var ending = new Date(this.auction.endingDate);
			if (today > ending) {
				this.completed = true;
				this.alertService.error("This auction has been closed");
			}
			this.dataService.getById(auction.seller_id).pipe(first()).subscribe(user => {
				this.seller = user;
				for (var i = 0; i < this.auction.bids.length; i++) {
					this.dataService.getBid(this.auction.bids[i]).pipe(first()).subscribe(bid => {
						this.bids.push(bid);
					});
				}
				this.loading = true;
				if (!this.auction.started) {
					if (!this.currentUser || this.auction.seller_id != this.currentUser._id)
						this.router.navigate(['/']);
				}
				this.bidForm = this.formBuilder.group({
					bid_price: [this.auction.currently+1, [Validators.required, this.bidPriceCheck(this.auction.currently)]]
				});
			});
		});
		
	}

	// convenience getter for easy access to form fields
    get f() { return this.bidForm.controls; }
	
	bidPriceCheck( cur : number) {
		return function (control: AbstractControl) {
			const price = control.value;
			if ( price ) {
				if ( price <= cur) {
					return {
						bidPriceCheck: true
					};
				}
				return null;
			}
			return null;
		};
	}

	onEditAClick(id: string) {
		this.editA = !this.editA;
		this.authenticationService.auctionE = id;
	}

	btnClicked() {
		this.bidClicked = !this.bidClicked;
		return;
	}

	onSubmit() {
		if (this.bidForm.invalid) {
			return;
		}
		this.dataService.addBid(this.auction._id, this.bidForm.value.bid_price, this.currentUser._id)
			.pipe(first())
			.subscribe(
				data => {
					this.alertService.success('Your bid was made successfully!', true);
					this.loading = false;
					this.bidClicked = false;
					this.bids = [];
					this.ngOnInit();
				},
				error => {
					console.log(error.error.error);
					this.alertService.error(error.error.error);
					// this.loading = false;
				});
	}

	onContactClick() {
		this.router.navigate(['/chat', this.auction.seller_id]);
	}
}
