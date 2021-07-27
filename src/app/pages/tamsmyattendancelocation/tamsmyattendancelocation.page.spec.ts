import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TamsmyattendancelocationPage } from './tamsmyattendancelocation.page';

describe('TamsmyattendancelocationPage', () => {
  let component: TamsmyattendancelocationPage;
  let fixture: ComponentFixture<TamsmyattendancelocationPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TamsmyattendancelocationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TamsmyattendancelocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
