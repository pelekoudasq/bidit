import { Component, OnInit, HostListener } from '@angular/core';
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
import { Category } from '../../models/category';

@Component({
    selector: 'app-newauction',
    templateUrl: './newauction.component.html',
    styleUrls: ['./newauction.component.css']
})
export class NewAuctionComponent implements OnInit {
    auctionForm: FormGroup;
    category: string[] = [];
    loading = false;
    submitted = false;
    image: File | null = null;
    currentUser: User;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private dataService: DataService,
        private alertService: AlertService,
        private authenticationService: AuthenticationService,
        private modalService: ModalService)
    {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.auctionForm = this.formBuilder.group({
            productName: ['', Validators.required],
            startingPrice: ['', Validators.required],
            buyPrice: ['', /*Validators.required*/],
            location: ['', Validators.required],
            longitude: [''],
            latitude: [''],
            country: ['', Validators.required],
            description: ['', Validators.required],
            image: ['', [Validators.required, this.requiredFileType('png')]],
            categories: ['', Validators.required]
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
            console.log(event.target.files);
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
        console.log(this.auctionForm);
        // stop here if form is invalid
        if (this.auctionForm.invalid) {
            console.log(this.auctionForm);
            return;
        }
        this.loading = true;
        this.dataService.addAuction(this.auctionForm.value, this.currentUser._id)
            .pipe(first())
            .subscribe(
                data => {
                    this.modalService.open('approval');
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

    selectchange(args){ 
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

        this.auctionForm.patchValue({
            categories: this.category
        });
    } 
}
