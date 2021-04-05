import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignPadTermsAndConditionPagePage } from './sign-pad-terms-and-condition-page.page';

describe('SignPadTermsAndConditionPagePage', () => {
  let component: SignPadTermsAndConditionPagePage;
  let fixture: ComponentFixture<SignPadTermsAndConditionPagePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SignPadTermsAndConditionPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignPadTermsAndConditionPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
