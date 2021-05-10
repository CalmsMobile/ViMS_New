import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-security-appointment-detail',
  templateUrl: './security-appointment-detail.page.html',
  styleUrls: ['./security-appointment-detail.page.scss'],
})
export class SecurityAppointmentDetailPage implements OnInit {

  constructor(public navCtrl: NavController,) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
   }

  logDrag(event, item, slideDOM) {
    let percent = event.detail.ratio;
    if (percent > 0) {
      this.closeSlide(slideDOM);
      // this.showAlertForSlide('delete', item);
    } else {
      this.closeSlide(slideDOM);
      // this.showAlertForSlide('edit', item);

    }
    if (Math.abs(percent) > 1) {
      // console.log('overscroll');
    }
  }

  closeSlide(slideDOM) {
    setTimeout(() => {
      slideDOM.close();
    }, 100);
  }

}
