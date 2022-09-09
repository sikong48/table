import { VizTriggerManager } from '~/interactions/trigger';
import { pluginManager, VizManager } from '~/plugins';
import {
  ClickCellContent,
  ClickCellContentSettings,
  IClickCellContentConfig,
} from '~/plugins/viz-components/table/triggers/click-cell-content';
import { VizInstance } from '~/types/plugin';
import { DEFAULT_TABLE_CONFIG, MOCK_DATA, TABLE_PANEL } from '../../../fixtures/mock-table';

describe('click-cell-content-settings.cy.tsx', () => {
  let instance: VizInstance;
  let vizManager: VizManager;
  let triggerManager: VizTriggerManager;
  beforeEach(() => {
    vizManager = new VizManager(pluginManager);
    instance = vizManager.getOrCreateInstance(TABLE_PANEL);
    triggerManager = new VizTriggerManager(instance, vizManager.resolveComponent(TABLE_PANEL.viz.type));
  });
  test('column from config', () => {
    cy.then(async () => {
      const trigger = await triggerManager.createOrGetTrigger('builtin:table:click-cell-content', ClickCellContent);
      cy.mount(<ClickCellContentSettings instance={instance} sampleData={MOCK_DATA} trigger={trigger} />);
      cy.findByLabelText('Choose a column').click();
      cy.findByText('Foo')
        .click()
        .then(async () => {
          const data = await trigger.triggerData.getItem<IClickCellContentConfig>('config');
          expect(data.column).to.deep.equal(0);
        });
    });
  });
  test('column from original data', () => {
    cy.then(async () => {
      await instance.instanceData.setItem('config', {
        ...DEFAULT_TABLE_CONFIG,
        columns: [],
        use_raw_columns: true,
      });
      const trigger = await triggerManager.createOrGetTrigger('builtin:table:click-cell-content', ClickCellContent);
      cy.mount(<ClickCellContentSettings instance={instance} sampleData={MOCK_DATA} trigger={trigger} />);
      cy.findByLabelText('Choose a column').click();
      cy.findByText('bar');
      cy.findByText('foo')
        .click()
        .then(async () => {
          const data = await trigger.triggerData.getItem<IClickCellContentConfig>('config');
          expect(data.column).to.deep.equal('foo');
        });
    });
  });
});
