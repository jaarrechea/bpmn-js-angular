import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import * as BpmnPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/bpmn';

import bpmnPropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';

import { customPropertiesProviderModule } from './props-provider/CustomPropertiesProviderModule';
import customModdleDescription from './props-provider/CustomModdleDescription.json';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import { debounce } from 'min-dash';
import { from, Observable, Observer, Subscription } from 'rxjs';

import { CustomTranslateService } from '../services/custom-translate.service';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
})
export class DiagramComponent implements OnInit {
  private bpmnModeler: BpmnModeler;

  @ViewChild('diagram', { static: true }) private el!: ElementRef;
  @ViewChild('panelProperties', { static: true }) private panelProperties!: ElementRef;
  @ViewChild('downloadDiagram', { static: true }) private downloadLink!: ElementRef;
  @ViewChild('downloadSvg', { static: true })
  private downloadSvgLink!: ElementRef;
  @Output() private importDone: EventEmitter<any> = new EventEmitter();

  @Input() public url!: string;
  @Input() public language: string = "en";

  private customTranslateModule = {};
  private modeling = null;
  private elementRegistry = null;

  private observer!: Observer<any>;
  xml: string;
  modifiedXML: boolean;

  constructor(private http: HttpClient, private translateService: CustomTranslateService) {
    this.changeLanguage(this.language);
    this.customTranslateModule = {
      translate: ['value', this.translateService.customTranslate],
    };

    this.bpmnModeler = new BpmnModeler({
      additionalModules: [
        propertiesPanelModule,
        bpmnPropertiesProviderModule,
        {
          ['bpmnPropertiesProvider']: ['type', BpmnPropertiesProvider.propertiesProvider[1]],
        },
        ,
        customPropertiesProviderModule,
        this.customTranslateModule,
      ],
      moddleExtensions: {
        custom: customModdleDescription,
      },
    });
  }

  ngOnInit(): void {}
  ngAfterContentInit(): void {
    this.bpmnModeler.on('import.done', ({ error }: { error: any }) => {
      if (!error) {
        this.bpmnModeler.get('canvas').zoom('fit-viewport');
      }
    });

    this.bpmnModeler.attachTo(this.el.nativeElement);
    const propertiesPanel = this.bpmnModeler.get('propertiesPanel');
    propertiesPanel.detach();
    propertiesPanel.attachTo(`#${this.panelProperties.nativeElement.id}`);
    this.bpmnModeler.on('commandStack.changed', this.exportArtifacts);
    this.modeling = this.bpmnModeler.get('modeling');
    this.elementRegistry = this.bpmnModeler.get('elementRegistry');

    this.observer = {
      next: (warnings) => {
        this.importDone.emit({
          type: 'success',
          warnings,
        });

      },
      error: (err) => {
        this.importDone.emit({
          type: 'error',
          error: err,
        });
      },
      complete: () => {}
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes['url']) {
      this.loadUrl(changes['url'].currentValue);
    } if (changes['language']) {
      this.changeLanguage(changes['language'].currentValue);
      // Reload diagram
      // this.loadUrl(this.url);
      if (this.xml) {
        this.reloadDiagram()
      }
    }
  }

  private reloadDiagram(): Subscription {
    return this.importDiagram(this.xml)
    .pipe(
      map((result) => result.warnings)
    )
    .subscribe(this.observer);
  }

  ngOnDestroy(): void {
    this.bpmnModeler.destroy();
  }

  /**
   * Load diagram from URL and emit completion event
   */
  loadUrl(url: string): Subscription {
    return this.http
      .get(url, { responseType: 'text' })
      .pipe(
        switchMap((xml: string) => this.importDiagram(xml)),
        map((result) => result.warnings)
      )
      .subscribe(this.observer);
  }

  private importDiagram(xml: string): Observable<{ warnings: Array<any> }> {
    this.xml = xml;
    return from(this.bpmnModeler.importXML(xml) as Promise<{ warnings: Array<any> }>);
  }

  setEncoded(link: ElementRef, name: string, data: any, xml?:boolean): void {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.nativeElement.classList.add('active');
      if (xml) {
        this.xml = data;
      } else {
        link.nativeElement.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
      }
      link.nativeElement.setAttribute('download', name);
    } else {
      link.nativeElement.classList.remove('active');
    }
  }

  private exportArtifacts = debounce(async () => {
    try {
      const { svg } = await this.bpmnModeler.saveSVG();

      this.setEncoded(this.downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {
      console.error('Error happened saving SVG: ', err);

      this.setEncoded(this.downloadSvgLink, 'diagram.svg', null);
    }

    try {
      const { xml } = await this.bpmnModeler.saveXML({ format: true });

      this.setEncoded(this.downloadLink, 'diagram.bpmn', xml, true);
    } catch (err) {
      console.error('Error happened saving diagram: ', err);

      this.setEncoded(this.downloadLink, 'diagram.bpmn', null);
    }
    this.modifiedXML = true;

  }, 500);

  changeLanguage(language: string): void {
    this.translateService.setLanguage(language);
  }

  saveDiagram(): string|boolean {
    if (this.modifiedXML) {
      this.downloadLink.nativeElement.classList.remove('active');
      const data = 'data:application/bpmn20-xml;charset=UTF-8,' + this.xml;
      this.modifiedXML = false;
      return data;
    } else {
      return false;
    }
  }
}
