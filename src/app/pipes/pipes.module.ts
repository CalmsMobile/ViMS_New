import { NgModule } from '@angular/core';
import { CustomPipe } from './custom/custom';
import { FacilityPipe } from './facility/facility';
import { DateFormatPipe } from './custom/DateFormat';
import { CustomReversePipe } from './custom/custom_reverse';
@NgModule({
	declarations: [CustomPipe,CustomReversePipe, FacilityPipe,
		DateFormatPipe],
	imports: [],
	exports: [CustomPipe, CustomReversePipe, FacilityPipe,
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
