import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignPadVisitorDetailsPagePage } from './sign-pad-visitor-details-page.page';

describe('SignPadVisitorDetailsPagePage', () => {
  let component: SignPadVisitorDetailsPagePage;
  let fixture: ComponentFixture<SignPadVisitorDetailsPagePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SignPadVisitorDetailsPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignPadVisitorDetailsPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
