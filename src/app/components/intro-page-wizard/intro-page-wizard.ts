import { Component, Input, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'intro-page-wizard',
  templateUrl: 'intro-page-wizard.html'
})
export class IntroPageWizardComponent {
  @Input() data: any;
  @Input() events: any;
  @ViewChild('wizardSlider') slider: IonSlides;

  sliderOptions = { pager: true };
  path:boolean = false;
  prev:boolean = true;
  next:boolean = true;
  finish:any = true

  constructor() {
      this.prev = false;
      this.next = true;
      this.finish = false;
  }

  changeSlide(index: number): void {
      if (index > 0) {
          this.slider.slideNext(300);
      } else {
          this.slider.slidePrev(300);
      }
  }

  async slideHasChanged(): Promise<void> {
      try {
          this.prev = !this.slider.isBeginning();
          this.next = await this.slider.getActiveIndex() < (await this.slider.length() - 1);
          this.finish = this.slider.isEnd();
      } catch (e) { }
  }

  ngOnChanges(changes: { [propKey: string]: any }) {
      this.data = changes['data'].currentValue;
    }

  onEvent(event: string) {
      if (this.events[event]) {
          this.events[event]();
      }
      console.log(event);
  }

}
