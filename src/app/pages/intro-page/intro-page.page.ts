import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IntroService } from 'src/app/services/util/intro-service';

@Component({
  selector: 'app-intro-page',
  templateUrl: './intro-page.page.html',
  styleUrls: ['./intro-page.page.scss'],
})
export class IntroPagePage implements OnInit {

  params:any = null;
  constructor(public viewCtrl: ModalController, public introService: IntroService) {
    var that = this;
    this.introService.load().subscribe(snapshot => {
      setTimeout(() => {
        that.params = {
          'events': {
            'onFinish': function (event: any) {
              that.viewCtrl.dismiss();
            }
          },
          'data': snapshot
        };
      });
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter IntroPage');
  }

  ngOnInit() {
  }

}
