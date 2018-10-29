import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RedditService } from '../services/reddit.service';
import { FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


import { DataService } from "../services/data.service";
import { SettingsPage } from "../settings/settings.page";
// Browser del dispositivo
import { Plugins } from '@capacitor/core';
const { Browser } = Plugins;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {


  posts: any;
  subredditForm: FormGroup;

  constructor(
    private dataService: DataService,
    private redditService: RedditService,
    private modalController: ModalController) {

    this.subredditForm = new FormGroup({
      subredditControl: new FormControl('')
    });
  }

  loadMore(): void{
    this.redditService.nextPage();
  }

  ngOnInit(): void {
    this.redditService.load();
    this.subredditForm.get('subredditControl').valueChanges.pipe(
      debounceTime(1500), distinctUntilChanged()
    ).subscribe((subreddit: any) => {
      if (subreddit.length > 0){
        this.redditService.changeSubreddit(subreddit);
        //Keyboard.hide().catch((err) => console.warn(err) );
      }
    });
  }


  openSettings(): void {
    this.modalController.create({
      component: SettingsPage
    }).then((modal) => {
      modal.onDidDismiss().then(() => this.redditService.resetPosts() );
      modal.present();
    });
  }

  playVideo(e, post): void{
    console.log(e);

    const video = e.target;
    if (video.paused){ video.play(); }
    else { video.pause(); }

  }

  showComments(post): void{
    Browser.open({
      toolbarColor: '#fff',
      url: 'http://reddit.com' + post.data.permalink,
      windowName: '_system',
    });

  }

}
