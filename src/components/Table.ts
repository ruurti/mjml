// Specs: https://documentation.mjml.io/#mj-table
import type { Editor } from 'grapesjs';
import { ComponentPluginOptions } from '.';
import { componentsToQuery, getName } from './utils';
import { type as typeColumn } from './Column';
import { type as typeHero } from './Hero';

export const type = 'mj-table';

function parseTableContent(content: string): HTMLTableElement {
  const table = document.createElement('table');
  table.innerHTML = content;
  return table;
}

function getColumnCount(table: HTMLTableElement): number {
  let max = 0;
  table.querySelectorAll('tr').forEach(row => {
    let count = 0;
    row.querySelectorAll('th, td').forEach((cell: Element) => {
      count += (cell as HTMLTableCellElement).colSpan || 1;
    });
    if (count > max) max = count;
  });
  return max;
}

export default (editor: Editor, { coreMjmlModel, coreMjmlView }: ComponentPluginOptions) => {

  // Table operation functions — used as inline toolbar commands (no toggle behavior)
  const tableAddRow = (ed: Editor) => {
    const selected = ed.getSelected();
    if (!selected || selected.get('type') !== type) return;
    const content = selected.get('content') || '';
    const table = parseTableContent(content);
    const cols = getColumnCount(table) || 3;
    const row = document.createElement('tr');
    for (let i = 0; i < cols; i++) {
      const td = document.createElement('td');
      td.style.padding = '0 15px';
      td.textContent = '-';
      row.appendChild(td);
    }
    table.appendChild(row);
    selected.set('content', table.innerHTML);
  };

  const tableRemoveRow = (ed: Editor) => {
    const selected = ed.getSelected();
    if (!selected || selected.get('type') !== type) return;
    const content = selected.get('content') || '';
    const table = parseTableContent(content);
    const rows = table.querySelectorAll('tr');
    if (rows.length > 1) {
      rows[rows.length - 1].remove();
      selected.set('content', table.innerHTML);
    }
  };

  const tableAddColumn = (ed: Editor) => {
    const selected = ed.getSelected();
    if (!selected || selected.get('type') !== type) return;
    const content = selected.get('content') || '';
    const table = parseTableContent(content);
    table.querySelectorAll('tr').forEach(row => {
      const isHeader = row.querySelector('th') !== null;
      const cell = document.createElement(isHeader ? 'th' : 'td');
      cell.style.padding = '0 15px';
      cell.textContent = '-';
      row.appendChild(cell);
    });
    selected.set('content', table.innerHTML);
  };

  const tableRemoveColumn = (ed: Editor) => {
    const selected = ed.getSelected();
    if (!selected || selected.get('type') !== type) return;
    const content = selected.get('content') || '';
    const table = parseTableContent(content);
    if (getColumnCount(table) > 1) {
      table.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('th, td');
        if (cells.length > 1) {
          cells[cells.length - 1].remove();
        }
      });
      selected.set('content', table.innerHTML);
    }
  };

  editor.Components.addType(type, {
    // mj-table is an "ending tag": raw HTML content, not MJML child components.
    isComponent(el: Element) {
      if ((el.tagName || '').toLowerCase() === type) {
        return { type, content: el.innerHTML };
      }
    },

    model: {
      ...coreMjmlModel,
      defaults: {
        tagName: 'mj-table',
        name: getName(editor, 'table'),
        draggable: componentsToQuery([typeColumn, typeHero]),
        droppable: false,
        highlightable: false,
        stylable: [
          'font-size', 'font-family', 'color', 'line-height', 'align',
          'padding', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom',
          'container-background-color', 'border', 'table-layout', 'width',
        ],
        'style-default': {
          'padding-top': '10px',
          'padding-bottom': '10px',
          'padding-right': '25px',
          'padding-left': '25px',
          'font-size': '13px',
          'line-height': '22px',
          'align': 'left',
          'color': '#000000',
          'border': 'none',
          'table-layout': 'auto',
          'width': '100%',
        },
        traits: [
          { type: 'number', name: 'cellpadding', label: 'Cell Padding', min: 0 },
          { type: 'number', name: 'cellspacing', label: 'Cell Spacing', min: 0 },
          {
            type: 'select', name: 'role', label: 'Role',
            options: [
              { value: '', name: 'Default' },
              { value: 'none', name: 'None' },
              { value: 'presentation', name: 'Presentation' },
            ],
          },
        ],
        toolbar: [
          { attributes: { class: 'fa fa-arrows', title: 'Move' }, command: 'tlb-move' },
          { attributes: { class: 'fa fa-plus', title: 'Add Row' }, command: tableAddRow as any },
          { attributes: { class: 'fa fa-minus', title: 'Remove Row' }, command: tableRemoveRow as any },
          { attributes: { class: 'fa fa-plus-square-o', title: 'Add Column' }, command: tableAddColumn as any },
          { attributes: { class: 'fa fa-minus-square-o', title: 'Remove Column' }, command: tableRemoveColumn as any },
          { attributes: { class: 'fa fa-clone', title: 'Clone' }, command: 'tlb-clone' },
          { attributes: { class: 'fa fa-trash-o', title: 'Delete' }, command: 'tlb-delete' },
        ],
      },
    },

    view: {
      ...coreMjmlView,
      tagName: 'tr',
      attributes: {
        style: 'pointer-events: all; display: table; width: 100%',
      },

      init() {
        coreMjmlView.init.call(this);
        // Auto-rerender when content changes (e.g. from toolbar commands)
        this.listenTo(this.model, 'change:content', this.rerender);
        // Delegate focusout on view element (added once, survives innerHTML changes)
        this.el.addEventListener('focusout', (e: FocusEvent) => {
          const target = e.target as HTMLElement;
          if (target && target.getAttribute('contenteditable') &&
              (target.tagName === 'TD' || target.tagName === 'TH')) {
            this.syncContentFromView();
          }
        });
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-column>`,
          end: `</mj-column></mj-body></mjml>`,
        };
      },

      getInnerMjmlTemplate() {
        const model: any = this.model;
        const tagName = model.get('tagName');
        const attr = model.getMjmlAttributes();
        let strAttr = '';
        for (let prop in attr) {
          const val = attr[prop];
          strAttr += typeof val !== 'undefined' && val !== '' ? ' ' + prop + '="' + val + '"' : '';
        }
        const content = model.get('content') || '';
        return {
          start: `<${tagName}${strAttr}>${content}`,
          end: `</${tagName}>`,
        };
      },

      getTemplateFromEl(sandboxEl: any) {
        return sandboxEl.querySelector('tr').innerHTML;
      },

      getChildrenSelector() {
        return 'td > table';
      },

      renderChildren() {},

      rerender() {
        this.render();
      },

      /**
       * After render, make cells in the content table editable.
       */
      postRender() {
        // Find the innermost table (the actual content table, not wrapper tables)
        const tables = this.el.querySelectorAll('table');
        const contentTable = tables[tables.length - 1];
        if (contentTable) {
          contentTable.querySelectorAll('td, th').forEach(cell => {
            (cell as HTMLElement).setAttribute('contenteditable', 'true');
            (cell as HTMLElement).style.cursor = 'text';
          });
        }
      },

      /**
       * Read current cell contents from the rendered view and save back to model.
       * Uses { silent: true } to avoid triggering a rerender loop.
       */
      syncContentFromView() {
        const tables = this.el.querySelectorAll('table');
        const contentTable = tables[tables.length - 1];
        if (!contentTable) return;

        const clone = contentTable.cloneNode(true) as HTMLTableElement;
        // Clean editing attributes before saving
        clone.querySelectorAll('[contenteditable]').forEach((el: Element) => {
          el.removeAttribute('contenteditable');
        });
        clone.querySelectorAll('td, th').forEach(el => {
          (el as HTMLElement).style.removeProperty('cursor');
        });

        this.model.set('content', clone.innerHTML, { silent: true });
      },
    },
  });
};
