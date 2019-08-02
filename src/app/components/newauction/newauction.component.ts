import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

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
    currentUser: User;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private dataService: DataService,
        private alertService: AlertService,
        private modalService: ModalService) {
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
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.auctionForm.controls; }

    onSubmit() {
        this.submitted = true;
        console.log("!!Sivmit");
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
