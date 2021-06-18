import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-tool-tip',
  templateUrl: './tool-tip.component.html',
  styleUrls: ['./tool-tip.component.scss'],
})
export class ToolTipComponent implements OnInit {
  message = '';
  constructor(public viewCtrl: ModalController,
    private events: EventsService,
    public navParams: NavParams) {
      this.message =this.navParams.data.data.title;
     }

  ngOnInit() {
  }

}
