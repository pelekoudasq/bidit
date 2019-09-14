import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

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
	xmlAuction: any;
	auctionJsonUri = [];
	auctionXmlUri = [];
	approvedUsers: User[] = [];
	disapprovedUsers: User[] = [];
	currentUser: User;
	loggedin: boolean;
	loading: boolean = false;
	loading2: boolean = false;

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
			for (var i = 0; i < this.auctions.length; i++) {
				// var auct = this.auctions[i];				
				// // XML
				// var XMLWriter = require('xml-writer');
				// var xw = new XMLWriter(true);
				// xw.startElement('Item');
				// xw.writeAttribute('ItemID', auct._id);
				// xw.writeElement('Name', auct.name);
				// auct.categories.forEach(cat => {
				// 	xw.writeElement('Category', cat)
				// });
				// xw.writeElement('Currently', "$"+auct.currently);
				// if(auct.buy_price)
				// 	xw.writeElement('Buy_Price', "$"+auct.buy_price);
				// xw.writeElement('First_Bid', "$"+auct.first_bid);
				// xw.writeElement('Number_of_Bids', auct.number_of_bids);
				// // xw.startElement('Bids');
				// // xw.endElement();
				// xw.writeElement('Location', auct.location.name).writeAttribute('Latitude', auct.location.latitude).writeAttribute('Longtitude', auct.location.longitude);
				// xw.writeElement('Country', auct.country);
				// if(auct.started){
				// 	xw.writeElement('Started', auct.startingDate);			
				// 	xw.writeElement('Ends', auct.endingDate);
				// }
				// // xw.writeElement('Seller');
				// xw.writeElement('Description', auct.description);				
				// this.auctionXmlUri.push(this.sanitizer.bypassSecurityTrustUrl("data:application/xml;charset=UTF-8," + encodeURIComponent(xw)));
				// JSON
				// var convert = require('xml-js');
				// var options = {compact: true, ignoreComment: true, spaces: 4};
				// var theJSON = convert.xml2json(xw, options);
				// this.auctionJsonUri.push(this.sanitizer.bypassSecurityTrustUrl("data:application/json;charset=UTF-8," + encodeURIComponent(theJSON)));
				
			}
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
                    this.auctionJsonUri = [];
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
                    this.auctionJsonUri = [];
                    this.ngOnInit();
                },
                error => {
                    this.alertService.error("Disapproval denied");
                });
	}

	downloadXML(i: number) {
		var link = document.createElement("a");
		link.download = 'auction.xml';
		var auct = this.auctions[i];
		// console.log(auct.name);			
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
		// xw.startElement('Bids');
		// xw.endElement();
		xw.writeElement('Location', auct.location.name).writeAttribute('Latitude', auct.location.latitude).writeAttribute('Longtitude', auct.location.longitude);
		xw.writeElement('Country', auct.country);
		if(auct.started){
			xw.writeElement('Started', auct.startingDate);				
			xw.writeElement('Ends', auct.endingDate);
		}
		// xw.writeElement('Seller');
		xw.writeElement('Description', auct.description);
		let XMLfile:any;
		XMLfile = this.sanitizer.bypassSecurityTrustUrl("data:application/xml;charset=UTF-8," + encodeURIComponent(xw));
		link.href = XMLfile;
		console.log(link.href);
		link.click();
	}
}