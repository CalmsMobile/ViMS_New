import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { EventsService } from 'src/app/services/EventsService';
import { CommonUtil } from 'src/app/services/util/CommonUtil';

@Component({
  selector: 'app-country-component',
  templateUrl: './country-component.component.html',
  styleUrls: ['./country-component.component.scss'],
})
export class CountryComponentComponent implements OnInit {
countryListFiltered = [];
selectedCountry = {
  name: "",
  code: ""
}
isDone = false;
searchText = '';
selectedCountryValue = '';
  constructor(public viewCtrl: ModalController,
    private events: EventsService,
    public navParams: NavParams) {

   }

   selectCountry(event){
    console.log("relationship:" + JSON.stringify(event.detail));
    if (event.detail.value) {
      CommonUtil.countryList.forEach(element => {
        if (event.detail.value === element.code) {
          this.selectedCountry.name =element.name;
          this.selectedCountry.code =element.code;
          console.log('VisitorCountry'+ JSON.stringify(this.selectedCountry));
          this.isDone = true;
          return;
        }
      });

    }
    // this.visitorInfoModal.visitor_comp_id = ;

  }


   filterTechnologies(event, code) {
     let value = event?event.target.value: "";
     console.log(value);
     if (value || code) {
      this.countryListFiltered = [];
      CommonUtil.countryList.forEach(element => {
        if (value && element.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          this.countryListFiltered.push(element);
        } else if (code && element.code.toLowerCase().indexOf(code.toLowerCase()) > -1) {
          this.countryListFiltered.push(element);
          if (code === element.code) {
            this.selectedCountry.name =element.name;
            this.selectedCountry.code = code;
            this.searchText = this.selectedCountry.name;
            this.selectedCountryValue = this.selectedCountry.name;
          }

        }

      });
      if (this.selectedCountry.code) {
        this.isDone = true;
      }

     } else {
      this.countryListFiltered = CommonUtil.countryList;
     }
   }

  ngOnInit() {
    this.selectedCountry.code =this.navParams.data.data.countryTyped;
    this.filterTechnologies("", this.navParams.data.data.countryTyped);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  addVisitorsCountry(){
    this.events.publishDataCompany({
      action: 'countrySelected',
      title: "countrySelected",
      message: JSON.stringify(this.selectedCountry)
    });
    this.dismiss();
  }
}
