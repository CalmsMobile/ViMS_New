import { NgModule } from '@angular/core';
import { CustomPipe } from './custom/custom';
import { FacilityPipe } from './facility/facility';
import { DateFormatPipe } from './custom/DateFormat';
@NgModule({
	declarations: [CustomPipe, FacilityPipe,
		DateFormatPipe],
	imports: [],
	exports: [CustomPipe, FacilityPipe,
		DateFormatPipe]
})
export class PipesModule {
	static forRoot() {
		return {
			ngModule: PipesModule,
			providers: [],
		};
	 }
}
