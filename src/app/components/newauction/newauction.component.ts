import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';

import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
    selector: 'app-newauction',
    templateUrl: './newauction.component.html',
    styleUrls: ['./newauction.component.css']
})
export class NewAuctionComponent implements OnInit {
    auctionForm: FormGroup;
    loading = false;
    submitted = false;
    image: File | null = null;
    currentUser: User;
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
        private modalService: ModalService)
    {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.auctionForm = this.formBuilder.group({
            productName: ['', Validators.required],
            startingPrice: ['', Validators.required],
            buyPrice: ['', Validators.required],
            location: ['', Validators.required],
            country: ['', Validators.required],
            description: ['', Validators.required],
            image: ['', [Validators.required, this.requiredFileType('png')]]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.auctionForm.controls; }

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
                this.auctionForm.patchValue({
                    image: reader.result
                });
            };
        }
        this.image = event.target.files[0];
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.auctionForm.invalid) {
            return;
        }
        this.loading = true;
        this.dataService.addAuction(this.auctionForm.value, this.currentUser._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.modalService.open('approval');
                    // this.alertService.success('Auction added.', true);
                    // this.router.navigate(['/']);
                },
                error => {
                    this.alertService.error(error);
                    console.log(error);
                    this.loading = false;
                });
            }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

}
