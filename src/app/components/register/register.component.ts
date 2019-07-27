import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

// export interface UserType {
//     value: Number;
//     display: String;
// }

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	registerForm: FormGroup;
    loading = false;
    submitted = false;
    // useAs: UserType[] = [
    //     { value:1, display:"Bidder" },
    //     { value:2, display:"Seller" }
    // ]

	constructor(
		private formBuilder: FormBuilder,
        private router: Router,
        // private dataService: DataService,
        private alertService: AlertService) { }

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
        // this.dataService.register(this.registerForm.value)
        //     .pipe(first())
        //     .subscribe(
        //         data => {
        //             this.alertService.success('Registration successful', true);
        //             this.router.navigate(['/login']);
        //         },
        //         error => {
        //             this.alertService.error(error);
        //             this.loading = false;
        //         });
    }
}
