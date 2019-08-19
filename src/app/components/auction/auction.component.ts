import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Auction, Bid } from '../../models/auction';

@Component({
	selector: 'app-auction',
	templateUrl: './auction.component.html',
	styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit {

	requestedAuction: string;
	bidForm: FormGroup;
	auction: Auction;
	bids: Bid[] = [];
	currentUser: User;
	loading: boolean = false;
	seller: User;
	editA: boolean = false;
	bidClicked: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	transform() {
		return this.sanitizer.bypassSecurityTrustResourceUrl(this.auction.image);
	}

	ngOnInit() {
		this.requestedAuction = this.route.snapshot.params.id;
		this.dataService.getAuction(this.requestedAuction).pipe(first()).subscribe(auction => {
			this.auction = auction;
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
		//window.location.reload();
		if (this.bidForm.invalid) {
			return;
		}
		console.log(this.bidForm);
		this.dataService.addBid(this.auction._id, this.bidForm.value.bid_price, this.currentUser._id)
			.pipe(first())
			.subscribe(
				data => {
					// this.modalService.open('approval');
					// this.alertService.success('Edit successful.', true);
					// this.authenticationService.logout();
					// this.router.navigate(['/login']);
					this.loading = false;
					this.bidClicked = false;
					this.bids = [];
					this.ngOnInit();
				},
				error => {
					console.log(error);
					// this.alertService.error(error);
					// this.loading = false;
				});
	}

}
