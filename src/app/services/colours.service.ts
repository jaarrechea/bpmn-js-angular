import { Injectable } from '@angular/core';
import { Option } from '../model/option';
import { COLOURS } from '../mock-data/colours-data';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColoursService {

  constructor() { }

  public getColours() : Observable<Option[]> {
    const colours = of(COLOURS);
    return colours;
  }
}
