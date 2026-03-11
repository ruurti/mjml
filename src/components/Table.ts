// Specs: https://documentation.mjml.io/#mj-table
import type { Editor } from 'grapesjs';
import { ComponentPluginOptions } from '.';
import { componentsToQuery, getName, isComponentType } from './utils';
import { type as typeColumn } from './Column';
import { type as typeHero } from './Hero';

export const type = 'mj-table';

export default (editor: Editor, { coreMjmlModel, coreMjmlView }: ComponentPluginOptions) => {
  editor.Components.addType(type, {
    extend: 'text',
    extendFnView: ['onActive'],
    isComponent: isComponentType(type),

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'table'),
        draggable: componentsToQuery([typeColumn, typeHero]),
        highlightable: false,
        stylable: [
          'font-size',
          'font-weight',
          'font-family',
          'color',
          'line-height',
          'text-decoration',
          'align',
          'padding',
          'padding-top',
          'padding-left',
          'padding-right',
          'padding-bottom',
          'container-background-color',
          'border',
          'border-width',
          'border-style',
          'border-color',
          'width',
        ],
        'style-default': {
          'padding-top': '10px',
          'padding-bottom': '10px',
          'padding-right': '25px',
          'padding-left': '25px',
          'font-size': '13px',
          'align': 'left',
          'color': '#000000',
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
          start: `<mjml><mj-body><mj-column>`,
          end: `</mj-column></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        return sandboxEl.querySelector('tr').innerHTML;
      },

      getChildrenSelector() {
        return 'td > table';
      },

      /**
       * Prevent content repeating
       */
      rerender() {
        this.render();
      },

      /**
       * Need to make text selectable.
       */
      onActive() {
        this.getChildrenContainer().style.pointerEvents = 'all';
      },
    },
  });
};
