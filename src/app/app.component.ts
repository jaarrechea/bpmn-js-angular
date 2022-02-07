import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BMPN-JS - Angular';
  diagramUrl = '../assets/newDiagram.bpmn';
  @ViewChild('langSelect', { static: true }) private el!: ElementRef;
  importError?: Error;

  languages = [
    {"code": "en", "name": "English"},
    {"code": "es", "name": "Español"},
    {"code": "fr", "name": "Français"},
    {"code": "de", "name": "Deutsch"}
  ];

  language: string = "en";

  handleImported(event: any) {

    const {
      type,
      error,
      warnings
    } = event;

    if (type === 'success') {
      console.log(`Rendered diagram (%s warnings)`, warnings.length);
    }

    if (type === 'error') {
      console.error('Failed to render diagram', error);
    }

    this.importError = error;
    this.el.nativeElement.removeAttribute('disabled');
  }

  selectLanguage($event) {
    this.language = $event;
  }

}
