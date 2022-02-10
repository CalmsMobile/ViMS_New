import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatPipe } from './DateFormat';

/**
 * Generated class for the CustomPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */

@Pipe({name: 'groupBy'})
export class CustomPipe implements PipeTransform {
    transform(collection: Array<any>, property: string): Array<any> {
        // prevents the application from breaking if the array of objects doesn't exist yet
        if(!collection) {
            return null;
        }

        collection.sort((a, b) =>
          (a.StartDateTime? a.StartDateTime: a.START_DATE) <= (b.StartDateTime? b.StartDateTime: b.START_DATE) ? -1 : 1
        );

        const groupedCollection = collection.reduce((previous, current)=> {
          let itemDate = current['StartDateTime'];
          if (!itemDate){
            itemDate = current['START_DATE'];
          }
          if (itemDate){
            itemDate = itemDate.split('T')[0];
          }
          var key = current[property] + '|' + itemDate;
          if(!previous[key]) {
              previous[key] = [current];
          } else {
              previous[key].push(current);
          }

          return previous;
        }, {});


        var resultArray = Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));

        if(resultArray && resultArray.length > 0 && resultArray[0].value[0].StartDateTime){
            resultArray.sort((a, b) =>
            a.value[0].StartDateTime <= b.value[0].StartDateTime ? -1 : 1
            );
        }else{
            resultArray.sort((a, b) =>
            a.value[0].START_DATE <= b.value[0].START_DATE ? -1 : 1
            );
        }

        // resultArray.reverse();

        // this will return an array of objects, each object containing a group of objects
        return resultArray;
    }
}
