import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the FacilityPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'facilityGroupBy',
})
export class FacilityPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(collection: Array<any>, property: string): Array<any> {
    // prevents the application from breaking if the array of objects doesn't exist yet
    if(!collection) {
        return null;
    }

    const groupedCollection = collection.reduce((previous, current)=> {
        if(!previous[current[property]]) {
            previous[current[property]] = [current];
        } else {
            previous[current[property]].push(current);
        }

        return previous;
    }, {});

   
    var resultArray = Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));
        
    resultArray.sort((a, b) => 
    a.value[0].StartTime <= b.value[0].StartTime ? -1 : 1
    );
    resultArray.reverse();

    // this will return an array of objects, each object containing a group of objects
    return resultArray;
}
}
