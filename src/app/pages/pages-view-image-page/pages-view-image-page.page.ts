import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-pages-view-image-page',
  templateUrl: './pages-view-image-page.page.html',
  styleUrls: ['./pages-view-image-page.page.scss'],
})
export class PagesViewImagePagePage implements OnInit {

  imagePath = '';
  constructor(public navCtrl: NavController, private route: ActivatedRoute,
    private router: Router) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        this.imagePath = passData.image;
      }
    });

  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter PagesViewImagePage');
  }


  ngOnInit() {
  }

}
