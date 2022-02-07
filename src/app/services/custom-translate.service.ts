import { Injectable } from '@angular/core';
import lang_en from '../i18n/en';
import lang_es from '../i18n/es';
import lang_fr from '../i18n/fr';
import lang_de from '../i18n/de';

var translations = lang_en;
@Injectable({
  providedIn: 'root',
})
export class CustomTranslateService {


  constructor() {
  }

  public customTranslate(template: string, replacements: any): string {
    replacements = replacements || {};

    // Translate
    try {
      template = translations[template] || template;
      // template = lang_es[template] || template;
    } catch (error) {
      // Ignore entries not found
    }

    // Replace
    return template.replace(/{([^}]+)}/g, function (_, key) {
      return replacements[key] || '{' + key + '}';
    });
  }

  public setLanguage(language: string): void {
    if (language == 'es') {
      translations = lang_es;
    } else if (language == 'fr') {
      translations = lang_fr;
    } else if (language == 'de') {
      translations = lang_de;
    } else {
      translations = lang_en;
    }
  }
}
