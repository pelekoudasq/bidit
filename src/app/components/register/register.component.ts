import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

    registerForm: FormGroup;
    loading = false;
    submitted = false;

	constructor(
		private formBuilder: FormBuilder,
        private router: Router,
        private dataService: DataService,
        private alertService: AlertService,
        private modalService: ModalService) { }

	ngOnInit() {
		this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            password1: ['', [Validators.required, Validators.minLength(6)]],
            phone: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required],
            zipcode: ['', Validators.required],
        });
	}

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

	onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }
        this.loading = true;
        this.dataService.register(this.registerForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.modalService.open('approval');
                },
                error => {
                    console.log(error.error.error);
                    this.alertService.error(error.error.error);
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
