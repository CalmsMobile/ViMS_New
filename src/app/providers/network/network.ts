import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { AlertController } from '@ionic/angular';
import { EventsService } from 'src/app/services/EventsService';

/*
  Generated class for the NetworkProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export enum ConnectionStatusEnum {
    Online,
    Offline
}
@Injectable()
export class NetworkProvider {
    previousStatus: any = ConnectionStatusEnum.Offline;
  constructor(public http: HttpClient,
              public alertCtrl: AlertController,
              private eventCtrl: EventsService,
              public network: Network) {
    console.log('Hello NetworkProvider Provider');
    this.previousStatus = ConnectionStatusEnum.Online;
  }

  public initializeNetworkEvents(): void {
        this.network.onDisconnect().subscribe(() => {
            if (this.previousStatus === ConnectionStatusEnum.Online) {
                this.eventCtrl.publishDataCompany({
                  action: 'network:offline',
                  title: 'network:offline',
                  message: 'network:offline'
                });
            }
            this.previousStatus = ConnectionStatusEnum.Offline;
        });
        this.network.onConnect().subscribe(() => {
            if (this.previousStatus === ConnectionStatusEnum.Offline) {
                this.eventCtrl.publishDataCompany({
                  action: 'network:online',
                  title: 'network:online',
                  message: 'network:online'
                });
            }
            this.previousStatus = ConnectionStatusEnum.Online;
        });
    }

}
