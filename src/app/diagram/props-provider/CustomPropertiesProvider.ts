import * as EntryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { ColoursService } from '../../services/colours.service';
import { Option } from '../../model/option';

import { domify } from 'min-dom';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { AppInjector } from '../../app.module';

var trans;
export class CustomPropertiesProvider {
  static $inject = ['translate', 'bpmnPropertiesProvider'];

  private colours: Option[] = [];


  constructor(private translate, private bpmnPropertiesProvider) {
    trans = this.translate;
  }

  getTabs(element) {
    if (is(element, 'bpmn:Task')) {
      return this.bpmnPropertiesProvider.getTabs(element).concat({
        id: 'my-data',
        label: this.translate('My Data'),
        groups: [
          {
            id: 'data',
            label: this.translate('Data'),
            entries: [
              EntryFactory.textField(this.translate, {
                id: 'custom',
                label: this.translate('Datum'),
                modelProperty: 'myData',
              }),
              EntryFactory.selectBox(this.translate, {
                id: 'country',
                label: this.translate('Country'),
                modelProperty: 'country',
                description: this.translate('Countries'),
                selectOptions: [
                  { name: '', value: '00' },
                  { name: this.translate('Spain'), value: '34' },
                  { name: this.translate('France'), value: '33' },
                  { name: this.translate('Germany'), value: '49' },
                  { name: this.translate('United Kingdom'), value: '44' },
                ],
              }),
              EntryFactory.selectBox(this.translate, {
                id: 'colores',
                label: this.translate('Colour'),
                modelProperty: 'colour',
                description: this.translate('Colours'),
                selectOptions: this.getColours,
                setControlValue: true
              }),
            ],
          },
        ],
      });
    } else {
      return this.bpmnPropertiesProvider.getTabs(element);
    }
  }

  private getColours(element, inputNode): void {
    const coloursService = AppInjector.get(ColoursService)
    coloursService.getColours().subscribe( colours => {
      // remove existing options
      while (inputNode.firstChild) {
        inputNode.removeChild(inputNode.firstChild);
      }
      colours.forEach(colour => {
        let template = domify('<option value="' + colour.value + '">' + trans(colour.name) + '</option>')
        inputNode.appendChild(template);
      });
    });
  }

}
