import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	users: User[] = [];
	auctions: Auction[] = [];
	approvedUsers: User[] = [];
	disapprovedUsers: User[] = [];
	currentUser: User;
	loggedin: boolean;
	loading: boolean = false;
	loading2: boolean = false;
	file: any = null;

	constructor(
		private sanitizer: DomSanitizer,
		private route: ActivatedRoute,
        private router: Router,
		private dataService: DataService,
		private alertService: AlertService) {
	}

	ngOnInit() {
		this.dataService.getAll().pipe(first()).subscribe(users => { 
			this.users = users; 
			for (var i = 0; i < this.users.length; i++) {
				if (this.users[i].approved)
					this.approvedUsers.push(this.users[i]);
				else
					this.disapprovedUsers.push(this.users[i]);
			}
			this.loading = true;
		});
		this.dataService.getAuctions().pipe(first()).subscribe(auctions =>{
			this.auctions = auctions;
			this.loading2 = true;
		});
	}

	approve(user: User) {
		this.dataService.approveUser(user._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/admin']);
                    this.users = [];
                    this.approvedUsers = [];
                    this.disapprovedUsers = [];
                    this.ngOnInit();
                },
                error => {
                    this.alertService.error("Approval denied");
                });
	}

	disapprove(user: User) {
		this.dataService.disapproveUser(user._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate(['/admin']);
                    this.users = [];
                    this.approvedUsers = [];
                    this.disapprovedUsers = [];
                    this.ngOnInit();
                },
                error => {
                    this.alertService.error("Disapproval denied");
                });
	}

	getXML(i:number) {
		// var file:any;
		// this.downloadXML(i, 'n').then(file => {
		// 	console.log(file);
		// });
		// console.log(file);
		// setTimeout(() => {
		// 	const blob = new Blob([file], { type: 'text/xml' });
		// 	console.log(blob);
		// 	saveAs(blob, "auction.xml");
		// }, 3000);
		// this.file = null;
		this.file = this.downloadXML(i);
		setTimeout(() => {
			const blob = new Blob([this.file], { type: 'text/xml' });
			console.log(blob);
			saveAs(blob, "auction.xml");
			this.file = null;
		}, 3000);	
	}

	getJSON(i: number) {
		this.file = this.downloadXML(i);
		var convert = require('xml-js');
		var options = {compact: true, ignoreComment: true, spaces: 4};
		setTimeout(() => {
			if (this.file)
				var theJSON = convert.xml2json(this.file, options);
			setTimeout(() => {
				const blob = new Blob([theJSON], { type: 'text/json' });
				console.log(blob);
				saveAs(blob, "auction.json");
			}, 3000);
			
		}, 6000);
	}

	downloadXML(i: number) {
		var auct = this.auctions[i];
		// XML
		var XMLWriter = require('xml-writer');
		var xw = new XMLWriter(true);
		xw.startElement('Item');
		xw.writeAttribute('ItemID', auct._id);
		xw.writeElement('Name', auct.name);
		auct.categories.forEach(cat => {
			xw.writeElement('Category', cat)
		});
		xw.writeElement('Currently', "$"+auct.currently);
		if(auct.buy_price)
			xw.writeElement('Buy_Price', "$"+auct.buy_price);
		xw.writeElement('First_Bid', "$"+auct.first_bid);
		xw.writeElement('Number_of_Bids', auct.number_of_bids);
		xw.writeElement('Location', auct.location.name).writeAttribute('Latitude', auct.location.latitude).writeAttribute('Longtitude', auct.location.longitude);
		xw.writeElement('Country', auct.country);
		if(auct.started){
			xw.writeElement('Started', auct.startingDate);				
			xw.writeElement('Ends', auct.endingDate);
		}
		
		this.dataService.getById(auct.seller_id).pipe(first()).subscribe(seller => {
			xw.startElement('Seller');
			xw.writeAttribute('Rating', seller.sellerRating);
			xw.writeAttribute('UserID', seller.username);
			xw.endElement();
			xw.writeElement('Description', auct.description);
			xw.startElement('Bids');
			auct.bids.forEach(bid => {
				this.dataService.getBid(bid).pipe(first()).subscribe(bid => {
					this.dataService.getById(bid.bidder_id).pipe(first()).subscribe(bidder => {
						console.log("bid");
						xw.startElement('Bidder');
						xw.writeAttribute('Rating', bidder.bidderRating);
						xw.writeAttribute('UserID', bidder.username);
						xw.writeElement('Location', bidder.address.city);
						xw.writeElement('Country', bidder.address.country);
						xw.endElement();
						xw.writeElement('Time', bid.time);
						xw.writeElement('Amount', bid.amount);
					});				
				});
			});
			setTimeout(() => {
				xw.endElement();		
				this.file = xw;				
			}, 2000);
		});
	
	}

	downloadJSON(i: number) {
		// JSON
		let xw = this.downloadXML(i);
		var convert = require('xml-js');
		var options = {compact: true, ignoreComment: true, spaces: 4};
		var theJSON = convert.xml2json(xw, options);
		return theJSON;
	}
}