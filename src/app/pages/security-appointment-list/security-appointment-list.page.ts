import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-security-appointment-list',
  templateUrl: './security-appointment-list.page.html',
  styleUrls: ['./security-appointment-list.page.scss'],
})
export class SecurityAppointmentListPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  moveToDetailsPage(item) {
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data: item
        }
      }
    };
    this.router.navigate(['visitor-information'], navigationExtras);
  }

  showCalender() {

  }

  doRefresh(event) {

  }

  filterTechnologies(event) {
    const searchtext = event.target.value;
		 let val : string 	= searchtext;
		 // DON'T filter the technologies IF the supplied input is an empty string
		 if (val){

     } else {

     }
  }

  goBack() {
    this.router.navigateByUrl('security-dash-board-page');
    console.log('goBack ');
   }

}
