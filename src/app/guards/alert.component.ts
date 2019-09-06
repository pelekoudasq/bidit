import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from '../services/alert.service';

@Component({
    selector: 'alert',
    templateUrl: 'alert.component.html'
})

export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => { 
            this.message = message; 
        });
    }

    removeAlert() {
        // this.alerts = this.alerts.filter(x => x !== alert);
        this.alertService.clear();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}