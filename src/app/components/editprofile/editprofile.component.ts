import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';

@Component({
	selector: 'app-editprofile',
	templateUrl: './editprofile.component.html',
	styleUrls: ['./editprofile.component.css']
})
export class EditProfileComponent implements OnInit {

	editForm: FormGroup;
	loading = false;
	submitted = false;
	currentUser: User;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private dataService: DataService,
		private alertService: AlertService,
		private modalService: ModalService,
		private authenticationService: AuthenticationService)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	ngOnInit() {
		this.editForm = this.formBuilder.group({
			firstName: [this.currentUser.first_name, Validators.required],
			lastName: [this.currentUser.last_name, Validators.required],
			username: [this.currentUser.username, Validators.required],
			email: [this.currentUser.email, Validators.required],
			password: ['', [Validators.required, Validators.minLength(6)]],
			password1: ['', [Validators.required, Validators.minLength(6)]],
			phone: [this.currentUser.phone, Validators.required],
			address: [this.currentUser.address.street, Validators.required],
			city: [this.currentUser.address.city, Validators.required],
			country: [this.currentUser.address.country, Validators.required],
			zipcode: [this.currentUser.address.zipcode, Validators.required],
			longitude: [this.currentUser.address.longitude, Validators.required],
			latitude: [this.currentUser.address.latitude, Validators.required],
			afm: [this.currentUser.afm, Validators.required],
		});
	}

	onCancel() {
		location.reload();
	}

	// convenience getter for easy access to form fields
	get f() { return this.editForm.controls; }

	onSubmit() {
		this.submitted = true;

		// stop here if form is invalid
		if (this.editForm.invalid) {
			return;
		}
		this.loading = true;
		this.dataService.updateUser(this.editForm.value, this.currentUser._id)
			.pipe(first())
			.subscribe(
				data => {
					this.modalService.open('approval');
				},
				error => {
					this.alertService.error(error);
					this.loading = false;
				});
	}

	logout() {
		this.authenticationService.logout();
		this.router.navigate(['/login']);
	}

}
