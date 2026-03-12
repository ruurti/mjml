// Specs: https://documentation.mjml.io/#mj-carousel
import type { Editor } from 'grapesjs';
import { ComponentPluginOptions } from '.';
import { componentsToQuery, getName, isComponentType, mjmlConvert } from './utils';
import { type as typeColumn } from './Column';
import { type as typeHero } from './Hero';

export const type = 'mj-carousel';
export const typeImage = 'mj-carousel-image';

export default (editor: Editor, { opt, coreMjmlModel, coreMjmlView, sandboxEl }: ComponentPluginOptions) => {
  const injectCompiledStyles = (view: any, cssText: string) => {
    if (!cssText) {
      return;
    }

    const doc = view.el?.ownerDocument;
    if (!doc?.head) {
      return;
    }

    const styleId = `gjs-mjml-carousel-style-${view.model.cid}`;
    let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleEl) {
      const createdStyleEl = doc.createElement('style');
      createdStyleEl.id = styleId;
      doc.head.appendChild(createdStyleEl);
      styleEl = createdStyleEl;
    }

    if (styleEl) {
      styleEl.innerHTML = cssText;
    }
  };

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
        traits: [
          'src',
          'alt',
          'href',
          'rel',
          'target',
          'title',
          'thumbnails-src',
        ],
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
        let parentView = this.model.parent()?.view;

        // @ts-ignore
        if (parentView?.getInnerMjmlTemplate) {
          let mjmlCarousel = coreMjmlView.getInnerMjmlTemplate.call(parentView);
          return {
            start: `<mjml><mj-body><mj-section><mj-column>${mjmlCarousel.start}`,
            end: `${mjmlCarousel.end}</mj-column></mj-section></mj-body></mjml>`,
          };
        }
        return {
          start: `<mjml><mj-body><mj-section><mj-column><mj-carousel>`,
          end: `</mj-carousel></mj-column></mj-section></mj-body></mjml>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        const img = sandboxEl.querySelector('.mj-carousel-image img');
        return img ? img.outerHTML : '';
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
          'background-color',
          'border-radius',
          'icon-width',
          'left-icon',
          'right-icon',
          'thumbnails',
          'tb-border',
          'tb-border-radius',
          'tb-hover-border-color',
          'tb-selected-border-color',
          'tb-width',
          'tb-height',
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
          'align',
          'background-color',
          'border-radius',
          'icon-width',
          'left-icon',
          'right-icon',
          {
            type: 'select',
            label: 'Thumbnails',
            name: 'thumbnails',
            options: [
              { value: 'visible', name: 'Visible' },
              { value: 'hidden', name: 'Hidden' },
            ],
          },
          'tb-border',
          'tb-border-radius',
          'tb-hover-border-color',
          'tb-selected-border-color',
          'tb-width',
          'tb-height',
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
          start: `<mjml><mj-body><mj-section><mj-column>`,
          end: `</mj-column></mj-section></mj-body></mjml>`,
        };
      },

      getTemplateEl(sandboxEl: any) {
        return sandboxEl.querySelector('tr');
      },

      getTemplateFromMjml() {
        const mjmlTmpl = this.getMjmlTemplate();
        const innerMjml = this.getInnerMjmlTemplate();
        const htmlOutput = mjmlConvert(
          opt.mjmlParser,
          `${mjmlTmpl.start}${innerMjml.start}${innerMjml.end}${mjmlTmpl.end}`,
          opt.fonts,
        );
        const html = htmlOutput.html;
        const styles: string[] = [];

        sandboxEl.innerHTML = html;
        Array.from(sandboxEl.querySelectorAll('style')).forEach((item: any) => {
          styles.push(item.innerHTML);
        });

        const content = html.replace(/<body(.*)>/, '<body>');
        const start = content.indexOf('<body>') + 6;
        const end = content.indexOf('</body>');
        sandboxEl.innerHTML = content.substring(start, end).trim();

        const componentEl = this.getTemplateEl(sandboxEl);
        const attributes: Record<string, any> = {};
        const elAttrs = componentEl?.attributes || [];

        for (let elAttr, i = 0, len = elAttrs.length; i < len; i++) {
          elAttr = elAttrs[i];
          attributes[elAttr.name] = elAttr.value;
        }

        return {
          attributes,
          content: componentEl ? componentEl.innerHTML : '',
          style: styles.join(' '),
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        return sandboxEl.querySelector('tr').innerHTML;
      },

      getChildrenSelector() {
        return 'td';
      },

      render(p: any, c: any, opts: any, appendChildren: boolean) {
        this.renderAttributes();
        const mjmlResult = this.getTemplateFromMjml();
        this.el.innerHTML = mjmlResult.content;
        this.$el.attr(mjmlResult.attributes);
        injectCompiledStyles(this, mjmlResult.style);
        (this as any).renderChildren(appendChildren);
        this.childNodes = this.getChildrenContainer().childNodes;
        this.renderStyle();
        this.postRender();

        return this;
      },

      rerender() {
        coreMjmlView.rerender.call(this);
        this.model.components().models.forEach((item: any) => {
          if (item.attributes.type !== typeImage) {
            return;
          }
          item.view.rerender();
        });
      },

      init() {
        coreMjmlView.init.call(this);
        this.listenTo(this.model.get('components'), 'add remove update', this.render);
      },
    },
  });
};
