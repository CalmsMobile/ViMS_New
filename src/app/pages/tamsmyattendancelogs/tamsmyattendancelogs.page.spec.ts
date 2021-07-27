import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TamsmyattendancelogsPage } from './tamsmyattendancelogs.page';

describe('TamsmyattendancelogsPage', () => {
  let component: TamsmyattendancelogsPage;
  let fixture: ComponentFixture<TamsmyattendancelogsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TamsmyattendancelogsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TamsmyattendancelogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
