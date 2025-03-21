import { Instance, types } from 'mobx-state-tree';
import { IDashboard } from '../types';
import { ContextInfoType, ContextModel } from './context';
import { FiltersModel, getInitialFiltersPayload } from './filters';
import { QueriesModel } from './queries';
import { SQLSnippetsModel } from './sql-snippets';
import { createDashboardViewsModel, ViewsModel } from './views';

const DashboardModel = types
  .model({
    id: types.identifier,
    name: types.string,
    filters: FiltersModel,
    queries: QueriesModel,
    sqlSnippets: SQLSnippetsModel,
    views: ViewsModel,
    context: ContextModel,
  })
  .views((self) => ({
    get payloadForSQL() {
      return {
        context: self.context.current,
        sqlSnippets: self.sqlSnippets.current,
        filterValues: self.filters.values,
      };
    },
    get data() {
      const data = self.queries.current.map(({ id, data }) => ({ id, data }));
      return data.reduce((ret, curr) => {
        ret[curr.id] = curr.data;
        return ret;
      }, {} as Record<string, $TSFixMe[]>);
    },
    getDataStuffByID(queryID: string) {
      const q = self.queries.findByID(queryID);
      if (!q) {
        return {
          data: [],
          state: 'idle',
          error: undefined,
        };
      }
      return {
        data: q.data.toJSON(),
        state: q.state,
        error: q.error,
      };
    },
    getDataStateByID(queryID: string) {
      return self.queries.findByID(queryID)?.state ?? [];
    },
    getDataErrorByID(queryID: string) {
      return self.queries.findByID(queryID)?.error ?? [];
    },
  }));

export function createDashboardModel(
  { id, name, filters, views, definition: { queries, sqlSnippets } }: IDashboard,
  context: ContextInfoType,
) {
  return DashboardModel.create({
    id,
    name,
    filters: getInitialFiltersPayload(filters),
    queries: {
      original: queries,
      current: queries,
    },
    sqlSnippets: {
      original: sqlSnippets,
      current: sqlSnippets,
    },
    context,
    views: createDashboardViewsModel(views),
  });
}

export type DashboardModelInstance = Instance<typeof DashboardModel>;
