import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Chat, Message } from '../../models/chat';
import { AppComponent } from '../../app.component';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

	requestedChat: string;	//user
	currentUser: User;
	chat: Chat;
	otherUser: User;
	loading: boolean = false;
	message: string = null;
	messages: Message[] = [];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private authenticationService: AuthenticationService,
		private appComponent: AppComponent,
		private alertService: AlertService)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	ngOnInit() {
		this.requestedChat = this.route.snapshot.params.id;
		this.dataService.getById(this.requestedChat).pipe(first()).subscribe(user => {
			this.otherUser = user;

			this.dataService.getChatWithUser(this.requestedChat, this.currentUser._id).pipe(first()).subscribe(chat => {
				this.chat = chat;
				if (this.chat.messages) {
					for (var i = 0; i < this.chat.messages.length; i++) {
						this.dataService.getMessage(this.chat.messages[i], this.currentUser._id).pipe(first()).subscribe(message => {
							this.messages.push(message);
						});
					}
				}
				// if (this.chat.notify == this.currentUser._id) {
				// 	this.dataService.notifiedChat(this.chat._id).pipe(first()).subscribe(chat => {
				// 		this.chat = chat;
				// 		this.dataService.getUserMessages(this.currentUser._id).subscribe(chats => {
				// 			this.authenticationService.notifications = 0;
				// 			for (var i = chats.length - 1; i >= 0; i--) {
				// 				if (chats[i].notify == this.currentUser._id)
				// 					this.authenticationService.notifications++;
				// 			}
				// 		});
				// 	});
				// }
				this.loading = true;
			});
		});
	}

	onSend() {
		if (this.message) {
			this.dataService.sendMessage(this.message, this.chat._id, this.currentUser._id, this.requestedChat).pipe(first()).subscribe(chat => {
				this.chat = chat;
				this.messages = [];
				this.message = '';
				this.ngOnInit();
			});
		}
	}

	get sortMessages() {
		return this.messages.sort((a, b) => {
			return <any>new Date(a.time) - <any>new Date(b.time);
		});
	}

}
