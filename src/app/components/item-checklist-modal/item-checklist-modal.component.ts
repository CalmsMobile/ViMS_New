import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-item-checklist-modal',
  templateUrl: './item-checklist-modal.component.html',
  styleUrls: ['./item-checklist-modal.component.scss'],
})
export class ItemChecklistModalComponent implements OnInit {

  base64Image = "";
  data: any = {
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": ""
  };

  constructor(private modalctrl : ModalController,
    ) { }

  ngOnInit() {}
  
  dismissModal() {
    this.modalctrl.dismiss();
  }
}
