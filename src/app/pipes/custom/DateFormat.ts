import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Generated class for the CustomFacilityPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */

@Pipe({name: 'dateFormat'})
export class DateFormatPipe extends DatePipe implements PipeTransform {
    transform(value: string, format: string): any {
      return super.transform(value, format);
    }
  }
