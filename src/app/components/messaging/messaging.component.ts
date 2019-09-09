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

	inbox: Message[] = [];
	sent: Message[] = [];
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
		localStorage.removeItem('currentMessage');
		this.dataService.getUserInbox(this.currentUser._id).pipe(first()).subscribe(inbox_messages => {	
			var mess: string[] = [];
			for (var i = 0; i < inbox_messages.length ; i++) {
				this.dataService.getById(inbox_messages[i].sender_id).pipe(first()).subscribe(user => {
					mess.push(user.username);
				});
			}
			setTimeout(() => {
				for (var i = 0; i < inbox_messages.length ; i++) {
					inbox_messages[i].displayName = mess[inbox_messages.length - i - 1];
				}
				this.inbox = inbox_messages;
				this.loading = true;
			}, 1500);
		});
		this.dataService.getUserSent(this.currentUser._id).pipe(first()).subscribe(sent_messages => {
			var mess1: string[] = [];
			for (var i = 0; i < sent_messages.length ; i++) {
				this.dataService.getById(sent_messages[i].receiver_id).pipe(first()).subscribe(user => {
					mess1.push(user.username);
				});
			}
			setTimeout(() => {
				for (var i = 0; i < sent_messages.length ; i++) {
					sent_messages[i].displayName = mess1[sent_messages.length - i - 1];
				}
				this.sent = sent_messages;
				this.loading = true;
			}, 1500);
		});
	}

	onMessageClick(id: string) {
		var m = this.inbox.find(o => o._id === id);
		if (!m)
			m = this.sent.find(o => o._id === id);
		localStorage.setItem('currentMessage', JSON.stringify(m));
		// console.log(m);
		this.router.navigate(['/message', id]);
	}
}
