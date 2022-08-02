import React from "react";
import _ from "lodash";
import { DashboardMode, IDashboard, IDashboardConfig } from "../types/dashboard";
import { LayoutStateContext } from "../contexts/layout-state-context";
import { DefinitionContext } from "../contexts/definition-context";
import { ReadOnlyDashboardLayout } from "../layout/read-only";
import { ContextInfoContext, ContextInfoContextType, FilterValuesContext } from "../contexts";
import { APIClient } from "../api-caller/request";
import { ModalsProvider } from '@mantine/modals';
import { usePanelFullScreen } from "./use-panel-full-screen";
import { DashboardActionContext } from "../contexts/dashboard-action-context";
import { Box } from "@mantine/core";
import { FullScreenPanel } from "./full-screen-panel";
import { useFilters } from "./use-filters";
import { Filters } from "../filter";

interface IReadOnlyDashboard {
  context: ContextInfoContextType;
  dashboard: IDashboard;
  className?: string;
  config: IDashboardConfig;
}

export function ReadOnlyDashboard({
  context,
  dashboard,
  className = "dashboard",
  config,
}: IReadOnlyDashboard) {
  if (APIClient.baseURL !== config.apiBaseURL) {
    APIClient.baseURL = config.apiBaseURL;
  }

  const { filters, filterValues, setFilterValues } = useFilters(dashboard);

  const definition = React.useMemo(() => ({
    ...dashboard.definition,
    setSQLSnippets: () => { },
    setQueries: () => { },
  }), [dashboard]);

  const {
    viewPanelInFullScreen,
    exitFullScreen,
    inFullScreen,
    fullScreenPanel,
  } = usePanelFullScreen(dashboard.panels)

  return (
    <ModalsProvider>
      <ContextInfoContext.Provider value={context}>
        <FilterValuesContext.Provider value={filterValues}>
          <DashboardActionContext.Provider value={{
            addPanel: _.noop,
            duplidatePanel: _.noop,
            removePanelByID: _.noop,
            viewPanelInFullScreen,
            inFullScreen
          }}>
            <DefinitionContext.Provider value={definition}>
              <LayoutStateContext.Provider value={{ layoutFrozen: true, freezeLayout: () => { }, mode: DashboardMode.Use, inEditMode: false, inLayoutMode: false, inUseMode: true }}>
                {inFullScreen && (
                  <FullScreenPanel panel={fullScreenPanel!} exitFullScreen={exitFullScreen} />
                )}
                <Box className={className} sx={{ display: inFullScreen ? 'none' : 'block' }}>
                  <Filters filters={filters} filterValues={filterValues} setFilterValues={setFilterValues} />
                  <ReadOnlyDashboardLayout panels={dashboard.panels} />
                </Box>
              </LayoutStateContext.Provider>
            </DefinitionContext.Provider>
          </DashboardActionContext.Provider>
        </FilterValuesContext.Provider>
      </ContextInfoContext.Provider>
    </ModalsProvider>
  )
}