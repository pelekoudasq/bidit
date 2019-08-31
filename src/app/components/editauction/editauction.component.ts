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
                    location: [this.auction.location.name, Validators.required],
                    longitude: [this.auction.location.longitude],
                    latitude: [this.auction.location.latitude],
					country: [this.auction.country, Validators.required],
					description: [this.auction.description, Validators.required],
					image: [this.auction.image, [Validators.required, this.requiredFileType('png')]],
					categories: [this.auction.categories, Validators.required]
				});
            }, 
            error => {
                // console.log(error);
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

    async selectchange(args){ 
        this.category = [];
        for( var i = 0; i < args.target.selectedOptions.length; i++){
            this.category.push(args.target.selectedOptions[i].text);
        }
        for (let i = 0; i < this.category.length; i++) {
            this.dataService.getCategory(this.category[i]).pipe(first()).subscribe(cat => {
                for (let i = 0; i < cat.path.length; i++) {                
                    if (!this.category.includes(cat.path[i])){
                        this.category.push(cat.path[i]);
                    }
                }
            });
        }

        this.editForm.patchValue({
            categories: this.category
        });
            
        
    } 

}
