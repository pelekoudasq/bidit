import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Chat, Message } from '../../models/chat';

@Component({
	selector: 'app-messaging',
	templateUrl: './messaging.component.html',
	styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit {

	chats: Chat[] = [];
	currentUser: User;
	loading: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private authenticationService: AuthenticationService,
		private alertService: AlertService)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	ngOnInit() {
		for (var i = this.currentUser.chats.length - 1; i >= 0; i--) {
			this.dataService.getChat(this.currentUser.chats[i]).pipe(first()).subscribe(chat => {
				this.chats.push(chat);
			});
		}
		this.loading = true;
	}

	onChatClick(chat: any) {
		if (chat.participants[0] != this.currentUser._id)
			this.router.navigate(['/chat', chat.participants[0]]);
		else
			this.router.navigate(['/chat', chat.participants[1]]);
	}
}
