import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import {} from 'googlemaps';
// import { Map, View } from 'ol';
// import { Tile } from 'ol/layer';
// import { OSM } from 'ol/source';
// import {
// 	defaults as defaultControls,
// 	Attribution,
// 	FullScreen,
// 	ScaleLine,
// 	ZoomToExtent
//   } from "ol/control.js";
//   import {
// 	defaults as defaultInteractions,
// 	DragRotateAndZoom
//   } from "ol/interaction.js";
//   import { fromLonLat } from "ol/proj.js";
//   import TileLayer from "ol/layer/Tile.js";  

// import { oll } from '../../app.component';

// declare var ol;

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
	toViewMap: boolean = false;
	longitude: number;
	latitude: number;
	mapsrc: string;
	// map: any;
	// @ViewChild('gmap', {read: true}) gmapElement: ElementRef;
	// map: google.maps.Map;
	// private afterViewInitSubject: Subject<any> = new Subject();

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
		// this.initializeMap();
		this.longitude = 23.7156;
		this.latitude = 37.9282;
		this.mapsrc = "http://83.212.104.209:4200/?lat="+this.latitude+"&long="+this.longitude;
		this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.mapsrc);
		this.requestedAuction = this.route.snapshot.params.id;
		this.authenticationService.inAuction = true;
		this.dataService.getAuction(this.requestedAuction).pipe(first()).subscribe(auction => {
			this.auction = auction;
			var today = new Date();
			var ending = new Date(this.auction.endingDate);
			// console.log(ending, today);
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

	// viewMap() {
	// 	const mapProperties = {
	// 		center: new google.maps.LatLng(35.2271, -80.8431),
	// 		zoom: 15,
	// 		mapTypeId: google.maps.MapTypeId.ROADMAP
	// 	};
	// 	if (this.gmapElement) {
	// 		console.log("Heree");
	// 		this.map = new google.maps.Map(this.gmapElement.nativeElement,mapProperties);
	// 	}
	// 	else {
	// 		this.afterViewInitSubject.subscribe(() => {
	// 			console.log("H E R E");
	// 			this.map = new google.maps.Map(this.gmapElement.nativeElement,mapProperties);
	// 		})
	// 	}
	// 	console.log("view map");
	// 	this.toViewMap = true;
	// }

	ngAfterViewInit() {
		// this.afterViewInitSubject.next(true);
		// const mapProperties = {
		// 	center: new google.maps.LatLng(35.2271, -80.8431),
		// 	zoom: 15,
		// 	mapTypeId: google.maps.MapTypeId.ROADMAP
		// };
		// setTimeout(() => {
		// 	this.map = new google.maps.Map(this.gmapElement.nativeElement,mapProperties);		
		// }, 10000);
	}
	// 	console.log(`OnInit`);
	
	// 	var osmFrAttribution = `&copy; Openstreetmap France |
	// 	Données <a href="http://www.openstreetmap.org/copyright"
	// 	 rel="noreferrer">© les contributeurs OpenStreetMap</a>`;
	// 	var map = new Map({
	// 	  layers: [
	// 		new TileLayer({
	// 		  source: new OSM({
	// 			attributions: [osmFrAttribution]
	// 		  })
	// 		})
	// 	  ],
	// 	  controls: defaultControls({
	// 		attribution: false
	// 	  }).extend([
	// 		new Attribution({
	// 		  collapsible: false
	// 		}),
	// 		new ZoomToExtent({
	// 		  extent: [
	// 			813079.7791264898,
	// 			5929220.284081122,
	// 			848966.9639063801,
	// 			5936863.986909639
	// 		  ]
	// 		}),
	// 		new FullScreen(),
	// 		new ScaleLine()
	// 	  ]),
	// 	  interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
	// 	  target: "map",
	// 	  view: new View({
	// 		center: fromLonLat([2, 45]),
	// 		zoom: 6
	// 	  })
	// 	});
	
	//   }
	// // initializeMap() {
	// 	console.log("map creation");
	// 	this.map = new oll.Map({
	// 		target: 'map',
	// 		layers: [
	// 		  new oll.layer.Tile({
	// 			source: new oll.source.OSM()
	// 		  })
	// 		],
	// 		view: new oll.View({
	// 		  center: oll.proj.fromLonLat([73.8567, 18.5204]),
	// 		  zoom: 8
	// 		})
	// 	  });

	// }

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
		// console.log(this.bidForm);
		this.dataService.addBid(this.auction._id, this.bidForm.value.bid_price, this.currentUser._id)
			.pipe(first())
			.subscribe(
				data => {
					// this.modalService.open('approval');
					this.alertService.success('Your bid was made successfully!', true);
					// this.authenticationService.logout();
					// this.router.navigate(['/login']);
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
