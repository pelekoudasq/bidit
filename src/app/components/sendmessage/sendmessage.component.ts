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
	selector: 'app-sendmessage',
	templateUrl: './sendmessage.component.html',
	styleUrls: ['./sendmessage.component.css']
})
export class SendMessageComponent implements OnInit {

	currentUser: User;
	currentMessage: Message;
	otherUser: string;
	loading: boolean = false;
	requestedMessage: string;
	message: Message;
	new_message: string;
	chat: Chat;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private authenticationService: AuthenticationService,
		private alertService: AlertService)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.currentMessage = JSON.parse(localStorage.getItem('currentMessage'));
	}


	ngOnInit() {
		console.log(this.currentMessage);
		if (this.currentUser._id != this.currentMessage.sender_id)
			this.otherUser = this.currentMessage.sender_id;
		else
			this.otherUser = this.currentMessage.receiver_id;
		this.dataService.getMessage(this.currentMessage._id, this.currentUser._id).pipe(first()).subscribe(message => {
			this.dataService.getNotifications(this.currentUser._id).subscribe(notifications => {
				this.authenticationService.notifications = notifications;
				this.loading = true;
			});
		});
	}

	onSend() {
		if (this.new_message) {
			this.dataService.getChatWithUser(this.currentMessage.sender_id, this.currentUser._id).pipe(first()).subscribe(chat => {
				this.chat = chat;
				this.dataService.sendMessage(this.new_message, this.chat._id, this.currentUser._id, this.currentMessage.sender_id).pipe(first()).subscribe(chat => {
					this.router.navigate(['/messaging']);
				});
			});
		}
	}

	onChatClick() {
		this.router.navigate(['/chat', this.otherUser]);
	}
}
