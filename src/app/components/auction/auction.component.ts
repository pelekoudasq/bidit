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

	requestedAuction: string = null;
	bidForm: FormGroup;	
	auction: Auction;
	bids: Bid[] = [];
	currentUser: User;
	loading: boolean = false;
	seller: User;
	editA: boolean = false;
	bidClicked: boolean = false;
	completed: boolean = false;
	longitude: string = null;
	latitude: string = null;
	mapsrc: string;
	mapok: boolean = false;
	maxBid: Bid;
	recommendLoading: boolean = false;
	recommendedAuctions: Auction[] = [];

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

	transform(i: number) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(this.auction.photos[i].url);
	}

	

	ngOnInit() {
		if (!this.requestedAuction)	
			this.requestedAuction = this.route.snapshot.params.id;	
		this.authenticationService.inAuction = true;

		this.dataService.getAuction(this.requestedAuction).pipe(first()).subscribe(auction => {
			this.auction = auction;
			this.latitude = auction.location.latitude;
			if (auction.location.longitude)
				this.longitude = auction.location.longitude;
			else
				this.longitude = auction.location.longtitude; //oh well
			if (this.latitude && this.longitude)
				this.mapok = true;
			this.mapsrc = "https://83.212.102.165:4200/?lat="+this.latitude+"&long="+this.longitude;		
			this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.mapsrc);

			var today = new Date();
			var ending = new Date(this.auction.endingDate);
			if (today > ending || this.auction.bought) {
				this.completed = true;
				this.alertService.error("This auction has been closed");
			}
			if (auction.seller_id) {
				this.dataService.getById(auction.seller_id).pipe(first()).subscribe(user => {
					this.seller = user;
				});
			} else {
				this.seller = this.currentUser;
				this.seller.username = this.auction.seller_display;
			}
			this.maxBid = new Bid;
			this.maxBid.amount = -1;
			for (var i = 0; i < this.auction.bids.length; i++) {
				this.dataService.getBid(this.auction.bids[i]).pipe(first()).subscribe(bid => {
					this.dataService.getById(bid.bidder_id).pipe(first()).subscribe(user => {
						bid.username = user.username;
					});
					this.bids.push(bid);
					if (this.maxBid.amount < bid.amount)
						this.maxBid = bid;
				});
			}
			if (!this.auction.started) {
				if (!this.currentUser || (this.auction.seller_id != this.currentUser._id))
					this.router.navigate(['/']);
			}
			if (this.currentUser && this.auction.seller_id != this.currentUser._id) {
				this.dataService.auctionVisit(this.auction._id, this.currentUser._id).pipe(first()).subscribe(visit => {
					
				})
			}
			this.loading = true;	
			this.bidForm = this.formBuilder.group({
				bid_price: [this.auction.currently+1, [Validators.required, this.bidPriceCheck(this.auction.currently)]]
			});
		});
		if (this.currentUser) {
			this.dataService.getTopActiveAuctions().pipe(first()).subscribe(auctions => {
				this.recommendedAuctions = auctions;
				this.recommendLoading = true;
			});
		} else {
			this.dataService.getTopVisitedAuctions().pipe(first()).subscribe(auctions => {
				this.recommendedAuctions = auctions;
				this.recommendLoading = true;
			});
		}
		
	}
	
	transformRec(i: string) {
		let obj = this.recommendedAuctions.find(o => o._id === i);
		return this.sanitizer.bypassSecurityTrustResourceUrl(obj.photos[0].url);
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
		if (this.auction.buy_price && this.bidForm.value.bid_price >= this.auction.buy_price) {
			this.alertService.success('Your bid was higher than the buy out price. Your purchase was made successfully!', true);
			this.buyNow();
			return;
		} else {
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
	}

	onContactClick() {
		this.router.navigate(['/chat', this.auction.seller_id]);
	}

	get sortBids() {
		return this.bids.sort((a, b) => {
			return <any>new Date(b.time) - <any>new Date(a.time);
		});
	}

	buyNow() {
		this.dataService.addBid(this.auction._id, this.auction.buy_price, this.currentUser._id).pipe(first()).subscribe(
				data => {
					this.dataService.closeAuction(this.auction._id).pipe(first()).subscribe(auction =>{
						this.alertService.success('Your purchase was made successfully!', true);
						this.loading = false;
						this.bidClicked = false;
						this.bids = [];
						this.ngOnInit();
					});
				},
				error => {
					console.log(error.error.error);
					this.alertService.error(error.error.error);
					// this.loading = false;
				});
	}

	onNameClick(id: string) {
		if (id) {
			this.loading = false;
			this.requestedAuction = id;
			this.router.navigate(['/auction', id]);
			this.ngOnInit();
			// window.location.reload();
		}
	}
}
