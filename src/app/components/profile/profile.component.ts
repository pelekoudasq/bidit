import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { ModalService } from '../../services/modal.service';

import { User } from '../../models/user';
import { Auction, Bid } from '../../models/auction';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	// users: User[] = [];
	currentUser: User;
	// allAuctions: Auction[] = [];
	auctions: Auction[] = [];
	bids: Bid[] = [];
	loading: boolean = false;
	edit: boolean = false;
	editA: boolean = false;
	curAuctForModal: string;

	constructor(
		private route: ActivatedRoute,
		private dataService: DataService,
		private router: Router,
		private alertService: AlertService,
		private modalService: ModalService,
		private authenticationService: AuthenticationService,
		private datePipe: DatePipe)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	ngOnInit() {
		this.dataService.getUserAuctions(this.currentUser._id).pipe(first()).subscribe(auctions => {
			this.auctions = auctions;
			// for(let i = 0; i < this.auctions.length; i++) {
			// 	if (this.auctions[i].started) {
			// 		this.auctions[i].startingDateString = this.auctions[i].startingDate.toString();
			// 		if (this.auctions[i].endingDate)
			// 			this.auctions[i].endingDateString = this.auctions[i].endingDate.toString();
			// 	}
			// }
			this.dataService.getUserBids(this.currentUser._id).pipe(first()).subscribe(bids => {
				this.bids = bids;
				for(let i = 0; i < this.bids.length; i++) {
					this.dataService.getAuction(this.bids[i].auction_id).pipe(first()).subscribe(auction => {
						this.bids[i].name = auction.name;
						this.bids[i].current = auction.currently;
						this.bids[i].ends = auction.endingDate;					
					});
				}
				this.loading = true;
			});
		});
		// console.log(this.currentUser);
	}

	startAuction(id: string) {
		
		// if(!isNaN(val)){
		// 	console.log("ook")
		// }
		this.dataService.startAuction(id).pipe(first()).subscribe(auction => {
			//if (auction.started)
				console.log("hereee");
				this.router.navigate(['/profile']);
		});
	}

	onNameClick(id: string) {
		if (id)
			this.router.navigate(['/auction', id]);
	}

	openModal(id: string, auct_id: string) {
		this.curAuctForModal = auct_id;
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    onEditClick() {
    	this.edit = !this.edit;
	}
	
	onEditAClick(id: string) {
		this.editA = !this.editA;
		if (this.authenticationService.auctionE != "")
			this.authenticationService.auctionE = "";
		else
			this.authenticationService.auctionE = id;
		console.log(this.authenticationService.auctionE);	
	}
}
