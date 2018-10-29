import { HttpClient } from '@angular/common/http/';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class RedditService {

  public settings = {
    perPage: 10,
    subreddit: 'gifs',
    sort: '/hot'
  };

  public posts: any[] = [];
  public loading = false;
  private page = 1;
  private after: string;
  private moreCount = 0;

  constructor(private dataService: DataService, private httpClient: HttpClient) { }

  changeSubreddit(sb: string): void {
    this.settings.subreddit = sb;
    this.resetPosts();
  }

  fecthData(): void {
    let url = 'https://www.reddit.com/r/' +
    this.settings.subreddit + this.settings.sort + '/.json?limit=100';

    if (this.after) {
      url += '&after=' + this.after;
    }

    this.loading = true;

    this.httpClient.get(url).pipe(
      map((res: any) => {
        console.log(res);
        let respond = res.data.children;
        let validPosts = 0;

        // Quitamos todos los post que no contienen video
        respond = respond.filter(
          post => {
            // Si ya tenemos posts suficientes para una pagina paramos
            if (validPosts >= this.settings.perPage){
              return false;
            } else {
              // Solo nos interesa los ficheros .gifv o .webm
              // ademas cambiamos la extension a .mp4
              if ((post.data.url.indexOf('.gifv') > -1) || 
                 (post.data.url.indexOf('.webm') > -1)) {
                post.data.url = post.data.url.replace('.gifv', '.mp4').replace('.webm', '.mp4');                  

                // Si existe preview del video, se asigna al post como 'snapshot'
                if (typeof(post.data.preview) !== 'undefined'){
                  post.data.snapshot = post.data.preview.images[0].source.url.replace(/&amp;/g, '&');
                  if (post.data.snapshot === undefined) post.data.snapshot = '';
                } else {
                  post.data.snapshot = '';
                }
                validPosts++;
                return true;
              } else {
                return false;
              }
            }
          }
        );
        // Si tenemos suficientes post validos, se pone como el after, si no, se pone el último
        if (validPosts >= this.settings.perPage){
          this.after = respond[this.settings.perPage - 1].data.name;
        } else if (res.data.children.lenght > 0){
          this.after = res.data.children[res.data.children.lenght - 1].data.name;
        }
        console.log(this.after);
        return respond;
      })
    ).subscribe(
      (data) => {
        console.log(data);
        // Se añaden los post nuevos a los que ya teniamos
        this.posts.push(...data);
        // Seguimos buscando más gifs mientras no llenemos la página
        // Desistimos despues de 20 intentos
        if (this.moreCount > 20){
          console.log("Desistimos.");
          this.moreCount = 0;
          this.loading = false;
        } else {
          // Si aún no tenemos suficientes para rellenar la página seguimos buscando
          if (this.posts.length < (this.settings.perPage * this.page)) {
            this.moreCount++;
            this.fecthData();
          } else {
            this.loading = false;
            this.moreCount = 0;
          }
        }
      }, (error) => {
        console.log(error);
        console.log('Error en la captura de datos');
      }
    );
  }

  load(): void {
    this.dataService.getData().then(
      (settings) => { 
        if (settings != null){
          this.settings = settings;
        }
        this.fecthData();
      }
    );
  }

  nextPage(): void {
    this.after = null;
    this.page++;
    this.posts = [];
    this.fecthData();
  }

  resetPosts(): void {
    this.page = 1;
    this.fecthData();
  }
}
