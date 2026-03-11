// Specs: https://documentation.mjml.io/#mj-accordion
import type { Editor } from 'grapesjs';
import { ComponentPluginOptions } from '.';
import { componentsToQuery, getName, isComponentType } from './utils';
import { type as typeColumn } from './Column';
import { type as typeHero } from './Hero';

export const type = 'mj-accordion';
export const typeElement = 'mj-accordion-element';
export const typeTitle = 'mj-accordion-title';
export const typeText = 'mj-accordion-text';

export default (editor: Editor, { coreMjmlModel, coreMjmlView }: ComponentPluginOptions) => {
  // mj-accordion-text
  editor.Components.addType(typeText, {
    isComponent: isComponentType(typeText),
    extend: 'text',
    extendFnView: ['onActive'],

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'accordionText'),
        draggable: componentsToQuery(typeElement),
        highlightable: false,
        stylable: [
          'font-size',
          'font-family',
          'font-weight',
          'color',
          'background-color',
          'padding',
          'padding-top',
          'padding-left',
          'padding-right',
          'padding-bottom',
        ],
        'style-default': {
          'font-size': '13px',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'padding-right': '25px',
          'padding-left': '25px',
        },
      },
    },

    view: {
      ...coreMjmlView,
      tagName: 'tr',
      attributes: {
        style: 'pointer-events: all; display: table; width: 100%',
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-column><mj-accordion><mj-accordion-element>`,
          end: `</mj-accordion-element></mj-accordion></mj-column></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        const tr = sandboxEl.querySelector('.mj-accordion-content tr');
        return tr ? tr.innerHTML : sandboxEl.innerHTML;
      },

      getChildrenSelector() {
        return 'td > div';
      },

      rerender() {
        this.render();
      },

      onActive() {
        this.getChildrenContainer().style.pointerEvents = 'all';
      },
    },
  });

  // mj-accordion-title
  editor.Components.addType(typeTitle, {
    isComponent: isComponentType(typeTitle),
    extend: 'text',
    extendFnView: ['onActive'],

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'accordionTitle'),
        draggable: componentsToQuery(typeElement),
        highlightable: false,
        stylable: [
          'font-size',
          'font-family',
          'font-weight',
          'color',
          'background-color',
          'padding',
          'padding-top',
          'padding-left',
          'padding-right',
          'padding-bottom',
        ],
        'style-default': {
          'font-size': '13px',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'padding-right': '25px',
          'padding-left': '25px',
          'background-color': '#414141',
          'color': '#ffffff',
        },
      },
    },

    view: {
      ...coreMjmlView,
      tagName: 'tr',
      attributes: {
        style: 'pointer-events: all; display: table; width: 100%',
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-column><mj-accordion><mj-accordion-element>`,
          end: `</mj-accordion-element></mj-accordion></mj-column></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        const tr = sandboxEl.querySelector('.mj-accordion-title tr');
        return tr ? tr.innerHTML : sandboxEl.innerHTML;
      },

      getChildrenSelector() {
        return 'td > div';
      },

      rerender() {
        this.render();
      },

      onActive() {
        this.getChildrenContainer().style.pointerEvents = 'all';
      },
    },
  });

  // mj-accordion-element
  editor.Components.addType(typeElement, {
    isComponent: isComponentType(typeElement),

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'accordionElement'),
        draggable: componentsToQuery(type),
        droppable: componentsToQuery([typeTitle, typeText]),
        stylable: [
          'background-color',
          'border',
          'border-width',
          'border-style',
          'border-color',
          'font-family',
        ],
        'style-default': {
          'border': '2px solid black',
        },
      },
    },

    view: {
      ...coreMjmlView,
      tagName: 'div',
      attributes: {
        style: 'border: 1px solid #ccc; margin-bottom: 4px;',
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-column><mj-accordion>`,
          end: `</mj-accordion></mj-column></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        const el = sandboxEl.querySelector('.mj-accordion-element');
        return el ? el.innerHTML : sandboxEl.innerHTML;
      },

      getChildrenSelector() {
        return '.mj-accordion-title, .mj-accordion-content';
      },

      init() {
        coreMjmlView.init.call(this);
        this.listenTo(this.model.get('components'), 'add remove update', this.render);
      },
    },
  });

  // mj-accordion
  editor.Components.addType(type, {
    isComponent: isComponentType(type),

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'accordion'),
        draggable: componentsToQuery([typeColumn, typeHero]),
        droppable: componentsToQuery(typeElement),
        stylable: [
          'border',
          'border-width',
          'border-style',
          'border-color',
          'font-family',
          'padding',
          'padding-top',
          'padding-left',
          'padding-right',
          'padding-bottom',
          'container-background-color',
        ],
        'style-default': {
          'border': '2px solid black',
          'font-family': 'Ubuntu, Helvetica, Arial, sans-serif',
        },
      },
    },

    view: {
      ...coreMjmlView,
      tagName: 'tr',
      attributes: {
        style: 'display: table; width: 100%',
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-column>`,
          end: `</mj-column></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        return sandboxEl.querySelector('tr').innerHTML;
      },

      getChildrenSelector() {
        return 'td > .mj-accordion';
      },

      init() {
        coreMjmlView.init.call(this);
        this.listenTo(this.model.get('components'), 'add remove update', this.render);
      },
    },
  });
};
