// Specs: https://documentation.mjml.io/#mj-carousel
import type { Editor } from 'grapesjs';
import { ComponentPluginOptions } from '.';
import { componentsToQuery, getName, isComponentType } from './utils';
import { type as typeColumn } from './Column';
import { type as typeHero } from './Hero';

export const type = 'mj-carousel';
export const typeImage = 'mj-carousel-image';

export default (editor: Editor, { coreMjmlModel, coreMjmlView }: ComponentPluginOptions) => {
  // mj-carousel-image
  editor.Components.addType(typeImage, {
    isComponent: isComponentType(typeImage),
    extend: 'image',

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'carouselImage'),
        draggable: componentsToQuery(type),
        resizable: false,
        highlightable: false,
        stylable: [
          'width',
          'height',
        ],
        'style-default': {},
        traits: ['src', 'href', 'rel', 'target', 'alt', 'title'],
        void: false,
      },
    },

    view: {
      ...coreMjmlView,
      tagName: 'div',
      attributes: {
        style: 'display: inline-block; width: 100%;',
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-column><mj-carousel>`,
          end: `</mj-carousel></mj-column></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        const img = sandboxEl.querySelector('img');
        return img ? img.outerHTML : sandboxEl.innerHTML;
      },

      getChildrenSelector() {
        return 'img';
      },
    },
  });

  // mj-carousel
  editor.Components.addType(type, {
    isComponent: isComponentType(type),

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'carousel'),
        draggable: componentsToQuery([typeColumn, typeHero]),
        droppable: componentsToQuery(typeImage),
        stylable: [
          'align',
          'border-radius',
          'border-top-left-radius',
          'border-top-right-radius',
          'border-bottom-left-radius',
          'border-bottom-right-radius',
          'padding',
          'padding-top',
          'padding-left',
          'padding-right',
          'padding-bottom',
          'container-background-color',
        ],
        'style-default': {
          'align': 'center',
        },
        traits: [
          {
            type: 'select',
            label: 'Thumbnails',
            name: 'thumbnails',
            options: [
              { value: 'visible', name: 'Visible' },
              { value: 'hidden', name: 'Hidden' },
            ],
          },
        ],
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
        return 'td';
      },

      init() {
        coreMjmlView.init.call(this);
        this.listenTo(this.model.get('components'), 'add remove update', this.render);
      },
    },
  });
};
