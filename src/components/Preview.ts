// Specs: https://documentation.mjml.io/#mj-preview
import type { Editor } from 'grapesjs';
import { ComponentPluginOptions } from '.';
import { componentsToQuery, getName, isComponentType } from './utils';
import { type as typeHead } from './Head';

export const type = 'mj-preview';

export default (editor: Editor, { coreMjmlModel, coreMjmlView }: ComponentPluginOptions) => {
  editor.Components.addType(type, {
    isComponent: isComponentType(type),
    extend: 'text',
    extendFnView: ['onActive'],

    model: {
      ...coreMjmlModel,
      defaults: {
        name: getName(editor, 'preview'),
        draggable: componentsToQuery(typeHead),
        droppable: false,
        stylable: [],
        'style-default': {},
        'style': {},
        'attributes': {},
      },
    },

    view: {
      ...coreMjmlView,
      tagName: 'div',
      attributes: {
        style: 'pointer-events: all; padding: 5px; font-size: 12px; color: #888; border: 1px dashed #ccc; background: #f9f9f9;',
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-head>`,
          end: `</mj-head><mj-body></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        return sandboxEl.innerHTML;
      },

      renderStyle() {},

      getTemplateFromMjml() {
        return '';
      },

      render() {
        this.renderAttributes();
        const content = this.model.get('content') || '';
        this.el.innerHTML = `<span style="opacity:0.6;">[Preview]: </span>${content}`;
        this.renderStyle();
        this.postRender();
        return this;
      },

      /**
       * Need to make text selectable.
       */
      onActive() {
        this.el.style.pointerEvents = 'all';
      },
    },
  });
};
