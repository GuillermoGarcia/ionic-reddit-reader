import { Component } from '@angular/core';
import { RedditService } from '../services/reddit.service';
import { DataService } from '../services/data.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  constructor(
    public redditService: RedditService,
    private dataService: DataService,
    private modalController: ModalController) { }

  guardar(): void {
    this.dataService.saveData(this.redditService.settings);
    /*this.dataService.saveData({
      perPage: this.redditService.settings.perPage,
      sort: this.redditService.settings.sort,
      subreddit: this.redditService.settings.subreddit
    });*/
    this.cerrar();
  }

  cerrar(): void {
    this.modalController.dismiss();
  }
}