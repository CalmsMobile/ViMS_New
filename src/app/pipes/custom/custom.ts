import { Pipe, PipeTransform } from '@angular/core';

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

        const groupedCollection = collection.reduce((previous, current)=> {
            if(!previous[current[property]]) {
                previous[current[property]] = [current];
            } else {
                previous[current[property]].push(current);
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

        resultArray.reverse();

        // this will return an array of objects, each object containing a group of objects
        return resultArray;
    }
}
