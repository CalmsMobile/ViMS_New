import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomController } from '@ionic/angular';

interface Theme {
  name: string;
  styles: ThemeStyle[];
}

interface ThemeStyle {
  themeVariable: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeSwitcherService {

  private themes: Theme[] = [];
  private currentTheme: number = 0;

  public themeColor = {
    'Theme1': '#06beb6',
    'Theme2': '#ff4961'
  };
  constructor(private domCtrl: DomController, @Inject(DOCUMENT) private document) {



  }

  resetTheme(color) {
    this.themes = [
      {
        name: 'Theme1',
        styles: [
          { themeVariable: '--ion-color-primary', value: color},
          { themeVariable: '--ion-color-primary-rgb', value: '248,56,58'},
          { themeVariable: '--ion-color-primary-contrast', value: '#ffffff'},
          { themeVariable: '--ion-color-primary-contrast-rgb', value: '255,255,255'},
          { themeVariable: '--ion-color-primary-shade', value: color},
          { themeVariable: '--ion-color-primary-tint', value: color},
          { themeVariable: '--ion-item-ios-background-color', value: '#ffffff'},
          { themeVariable: '--ion-item-md-background-color', value: '#ffffff'},
          { themeVariable: '--ion-tabbar-background-color', value: '#fff'},
          { themeVariable: '--ion-tabbar-ios-text-color-active', value: '#000000'},
          { themeVariable: '--ion-tabbar-md-text-color-active', value: '#000000'}
        ]
      },
      {
        name: 'Theme2',
        styles: [
          { themeVariable: '--ion-color-primary', value: this.themeColor['Theme2']},
          { themeVariable: '--ion-color-primary-rgb', value: '34,34,34'},
          { themeVariable: '--ion-color-primary-contrast', value: '#ffffff'},
          { themeVariable: '--ion-color-primary-contrast-rgb', value: '255,255,255'},
          { themeVariable: '--ion-color-primary-shade', value: '#1e2023'},
          { themeVariable: '--ion-color-primary-tint', value: '#383a3e'},
          { themeVariable: '--ion-item-ios-background-color', value: '#717171'},
          { themeVariable: '--ion-item-md-background-color', value: '#717171'},
          { themeVariable: '--ion-tabbar-background-color', value: '#222428'},
          { themeVariable: '--ion-tabbar-ios-text-color-active', value: '#ffffff'},
          { themeVariable: '--ion-tabbar-md-text-color-active', value: '#ffffff'},
        ]
      }
    ]
  }

  cycleTheme(): void {

    if(this.themes.length > this.currentTheme + 1){
      this.currentTheme++;
    } else {
      this.currentTheme = 0;
    }

    this.setTheme(this.themes[this.currentTheme].name, '');

  }

  resetThemeNew(primaryColor,  texColor, buttonColor, buttonTextColor) {
    this.themes = [
      {
        name: 'Theme1',
        styles: [
          { themeVariable: '--ion-color-primary', value: primaryColor},
          { themeVariable: '--ion-color-primary-rgb', value: '248,56,58'},
          { themeVariable: '--ion-color-primary-contrast', value: texColor},
          { themeVariable: '--ion-color-primary-contrast-rgb', value: '255,255,255'},
          { themeVariable: '--ion-color-primary-shade', value: primaryColor},
          { themeVariable: '--ion-color-primary-tint', value: primaryColor},
          { themeVariable: '--ion-item-ios-background-color', value: '#ffffff'},
          { themeVariable: '--ion-item-md-background-color', value: '#ffffff'},
          { themeVariable: '--ion-tabbar-background-color', value: '#fff'},
          { themeVariable: '--ion-tabbar-ios-text-color-active', value: texColor},
          { themeVariable: '--ion-tabbar-md-text-color-active', value: texColor},

          { themeVariable: '--ion-color-btnthm', value: buttonColor},
          { themeVariable: '--ion-color-btnthm-rgb', value: '248,56,58'},
          { themeVariable: '--ion-color-btnthm-contrast', value: buttonTextColor},
          { themeVariable: '--ion-color-btnthm-contrast-rgb', value: '255,255,255'},
          { themeVariable: '--ion-color-btnthm-shade', value: buttonColor},
          { themeVariable: '--ion-color-btnthm-tint', value: buttonColor}
        ]
      },
      {
        name: 'Theme2',
        styles: [
          { themeVariable: '--ion-color-primary', value: this.themeColor['Theme2']},
          { themeVariable: '--ion-color-primary-rgb', value: '34,34,34'},
          { themeVariable: '--ion-color-primary-contrast', value: '#ffffff'},
          { themeVariable: '--ion-color-primary-contrast-rgb', value: '255,255,255'},
          { themeVariable: '--ion-color-primary-shade', value: '#1e2023'},
          { themeVariable: '--ion-color-primary-tint', value: '#383a3e'},
          { themeVariable: '--ion-item-ios-background-color', value: '#717171'},
          { themeVariable: '--ion-item-md-background-color', value: '#717171'},
          { themeVariable: '--ion-tabbar-background-color', value: '#222428'},
          { themeVariable: '--ion-tabbar-ios-text-color-active', value: '#ffffff'},
          { themeVariable: '--ion-tabbar-md-text-color-active', value: '#ffffff'},
        ]
      }
    ]
  }

  setThemeNew(primaryColor,  texColor, buttonColor, buttonTextColor): void {
    this.resetThemeNew(primaryColor,  texColor, buttonColor, buttonTextColor);
    let theme = this.themes.find(theme => theme.name === "Theme1");

    this.domCtrl.write(() => {

      theme.styles.forEach(style => {
        document.documentElement.style.setProperty(style.themeVariable, style.value);
      });

    });

  }

  setTheme(name, color): void {
    this.resetTheme(color);
    let theme = this.themes.find(theme => theme.name === name);

    this.domCtrl.write(() => {

      theme.styles.forEach(style => {
        document.documentElement.style.setProperty(style.themeVariable, style.value);
      });

    });

  }

}
