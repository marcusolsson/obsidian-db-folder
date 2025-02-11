import { ColumnsState, TableActionResponse } from "cdm/TableStateInterface";
import { DatabaseView } from "DatabaseView";
import create from "zustand";
import column_state_actions from "stateManagement/columns/ColumnsStateActions";

const useColumnsStore = (view: DatabaseView) => {
  return create<ColumnsState>()((set, get) => {
    const tableActionResponse: TableActionResponse<ColumnsState> = {
      view: view,
      set: set,
      get: get,
      implementation: {
        ...emptyColumnsState(),
        columns: view.columns,
        shadowColumns: view.shadowColumns,
      },
    };

    const columnActions = column_state_actions.run(tableActionResponse);
    return columnActions.implementation;
  });
};

function emptyColumnsState(): Omit<ColumnsState, "columns" | "shadowColumns"> {
  return {
    actions: {
      addToLeft: null,
      addToRight: null,
      remove: null,
      alterSorting: null,
      addOptionToColumn: null,
      alterColumnType: null,
      alterColumnId: null,
      alterColumnLabel: null,
      alterColumnSize: null,
      alterIsHidden: null,
      alterColumnConfig: null,
    },
    info: {
      getValueOfAllColumnsAsociatedWith: null,
      getVisibilityRecord: null,
      getAllColumns: null,
      getColumnOptions: null,
    },
  };
}

export default useColumnsStore;
