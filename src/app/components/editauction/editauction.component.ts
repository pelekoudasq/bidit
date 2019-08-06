import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
	selector: 'app-editauction',
	templateUrl: './editauction.component.html',
	styleUrls: ['./editauction.component.css']
})
export class EditAuctionComponent implements OnInit {

    selectedValue: string;
    selectedFruit: string;
	auction_id: string;
	auction: Auction;
    editForm: FormGroup;
    category: string[] = [];
	loading = false;
	submitted = false;
    currentUser: User;
	image: File | null = null;
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
		private formBuilder: FormBuilder,
		private router: Router,
		private dataService: DataService,
		private alertService: AlertService,
		private modalService: ModalService,
		private authenticationService: AuthenticationService) {
		
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.auction_id = authenticationService.auctionE;
	}

	ngOnInit() {

		this.dataService.getAuction(this.auction_id).pipe(first()).subscribe(
			auction => {
				this.auction = auction;
				this.editForm = this.formBuilder.group({
					productName: [this.auction.name, Validators.required],
					startingPrice: [this.auction.first_bid, Validators.required],
					buyPrice: [this.auction.buy_price, Validators.required],
					location: [this.auction.location, Validators.required],
					country: [this.auction.country, Validators.required],
					description: [this.auction.description, Validators.required],
					image: [this.auction.image, [Validators.required, this.requiredFileType('png')]],
					categories: [this.auction.categories, Validators.required]
				});
		});
		
	}

	onCancel() {
		location.reload();
	}

	// convenience getter for easy access to form fields
    get f() { return this.editForm.controls; }

    requiredFileType( type: string ) {
        return function (control: AbstractControl) {
            const file = control.value;
            if ( file ) {
                const dataType = file.split(';')[0].toLowerCase();
                if ( dataType.toLowerCase() !== "data:image/jpeg"/*type.toLowerCase()*/ ) {
                    return {
                        requiredFileType: true
                    };
                }
                return null;
            }
            return null;
        };
    }

    onFileSelected(event) {
        const reader = new FileReader();
        if(event.target.files && event.target.files.length) {
            const [file] = event.target.files;
            reader.readAsDataURL(file);
            reader.onload = () => {
                this.editForm.patchValue({
                    image: reader.result
                });
            };
        }
        this.image = event.target.files[0];
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.editForm.invalid) {
            return;
        }
        this.loading = true;
		this.dataService.updateAuction(this.editForm.value, this.auction_id)
			.pipe(first())
			.subscribe(
				data => {
					this.modalService.open('approval');
					// this.alertService.success('Edit successful.', true);
					// this.authenticationService.logout();
					// this.router.navigate(['/login']);
				},
				error => {
					console.log(error);
					this.alertService.error(error);
					this.loading = false;
				});
    }

    selectchange(args){ 
        for( var i = 0; i < args.target.selectedOptions.length; i++){
            this.category.push(args.target.selectedOptions[i].text);
        }
        this.editForm.patchValue({
            categories: this.category
        });
        this.category = [];
    } 

}
