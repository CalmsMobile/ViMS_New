import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuickPassDashBoardPagePage } from './quick-pass-dash-board-page.page';

describe('QuickPassDashBoardPagePage', () => {
  let component: QuickPassDashBoardPagePage;
  let fixture: ComponentFixture<QuickPassDashBoardPagePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickPassDashBoardPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickPassDashBoardPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
