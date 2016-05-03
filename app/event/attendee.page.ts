import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {AttendeeItem, AttendeeFull} from "./models/Attendee";
import {SessionItem} from "./models/Session";
import {ExponentItem} from "./models/Exponent";
import {EventData} from "./services/event.data";
import {RatingComponent} from "../common/components/rating.component";
import {TimePeriodPipe, WeekDayPipe} from "../common/pipes/datetime.pipe";
import {CapitalizePipe} from "../common/pipes/text.pipe";
import {NotEmptyPipe, JoinPipe} from "../common/pipes/array.pipe";
import {AttendeeFilterPage} from "./attendee-filter.page";
import {SessionPage} from "./session.page";
import {ExponentPage} from "./exponent.page";

@Page({
    pipes: [TimePeriodPipe, WeekDayPipe, CapitalizePipe, NotEmptyPipe, JoinPipe],
    directives: [RatingComponent],
    styles: [`
.item h2, .item p {
    white-space: initial;
}
.attendee-card {
    text-align: center;
}
.attendee-card img {
    border-radius: 50%;
    height: 100px;
}
.attendee-card h1, .attendee-card h4 {
    margin: 0px;
}
    `],
    template: `
<ion-navbar *navbar>
    <ion-title>Participant</ion-title>
    <ion-buttons end>
        <button (click)="toggleFav(attendeeItem)">
            <ion-icon name="star" [hidden]="!getFav(attendeeItem)"></ion-icon>
            <ion-icon name="star-outline" [hidden]="getFav(attendeeItem)"></ion-icon>
        </button>
    </ion-buttons>
</ion-navbar>
<ion-content>
    <div padding>
        <div class="attendee-card">
            <img [src]="attendeeItem.avatar"><br>
            <h1>{{attendeeItem.name}}</h1>
            <h4 (click)="goToCompany(attendeeItem)">{{[attendeeItem.job, attendeeItem.company] | notEmpty | join:', '}}</h4>
            <a clear small twitter *ngIf="attendeeItem.twitterUrl" [href]="attendeeItem.twitterUrl" target="_blank"><ion-icon name="logo-twitter"></ion-icon></a><br>
            <rating [value]="getRating(attendeeItem)" (change)="setRating(attendeeItem, $event)"></rating>
        </div>
        <p>{{attendeeItem.description}}</p>
    </div>
    <ion-list *ngIf="attendeeFull && attendeeFull.exponents.length > 0">
        <ion-list-header>Exposants</ion-list-header>
        <ion-item *ngFor="#exponent of attendeeFull.exponents" (click)="goToExponent(exponent)">
            <ion-avatar item-left><img [src]="exponent.logo"></ion-avatar>
            <h2>{{exponent.name}}</h2>
            <p class="nowrap lines2">{{exponent.description}}</p>
        </ion-item>
    </ion-list>
    <ion-list *ngIf="attendeeFull && attendeeFull.sessions.length > 0">
        <ion-list-header>Sessions</ion-list-header>
        <ion-item *ngFor="#session of attendeeFull.sessions" (click)="goToSession(session)">
            <h2>{{session.name}}</h2>
            <p>{{[session.place, session.category, (session.start|weekDay|capitalize)+' '+(session.start|timePeriod:session.end)] | notEmpty | join:' - '}}</p>
            <button clear item-right (click)="toggleSessionFav(session);$event.stopPropagation();">
                <ion-icon name="star" [hidden]="!getSessionFav(session)"></ion-icon>
                <ion-icon name="star-outline" [hidden]="getSessionFav(session)"></ion-icon>
            </button>
        </ion-item>
    </ion-list>
</ion-content>
`
})
export class AttendeePage implements OnInit {
    attendeeItem: AttendeeItem;
    attendeeFull: AttendeeFull;
    constructor(private _nav: NavController,
                private _navParams: NavParams,
                private _eventData: EventData) {}

    ngOnInit() {
        this.attendeeItem = <AttendeeItem> this._navParams.get('attendeeItem');
        this._eventData.getAttendeeFromCurrent(this.attendeeItem.uuid).then(attendee => this.attendeeFull = attendee);
    }

    getFav(attendee: AttendeeItem): boolean { return this._eventData.getAttendeeFavorite(attendee); }
    toggleFav(attendee: AttendeeItem) { this._eventData.toggleAttendeeFavorite(attendee); }
    getSessionFav(session: SessionItem): boolean { return this._eventData.getSessionFavorite(session); }
    toggleSessionFav(session: SessionItem) { this._eventData.toggleSessionFavorite(session); }
    getRating(attendee: AttendeeItem): number { return this._eventData.getAttendeeRating(attendee); }
    setRating(attendee: AttendeeItem, value: number) { this._eventData.setAttendeeRating(attendee, this.getRating(attendee) !== value ? value : 0); }

    goToCompany(attendeeItem: AttendeeItem) {
        this._nav.push(AttendeeFilterPage, {
            filter: { company: attendeeItem.company }
        });
    }

    goToExponent(exponentItem: ExponentItem) {
        this._nav.push(ExponentPage, {
            exponentItem: exponentItem
        });
    }

    goToSession(sessionItem: SessionItem) {
        this._nav.push(SessionPage, {
            sessionItem: sessionItem
        });
    }
}
