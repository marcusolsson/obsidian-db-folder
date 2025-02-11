import { AddColumnModalHandlerResponse } from "cdm/ModalsModel";
import { ColumnSettingsModal } from "components/modals/columnSettings/ColumnSettingsModal";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { DynamicInputType } from "helpers/Constants";
import { t } from "lang/helpers";
import { Setting } from "obsidian";
import { AbstractHandlerClass } from "patterns/chain/AbstractHandler";

export class QuickOptionsColumnsHandler extends AbstractHandlerClass<AddColumnModalHandlerResponse> {
  settingTitle: string = t("add_row_modal_quick_options_title");
  handle(
    response: AddColumnModalHandlerResponse
  ): AddColumnModalHandlerResponse {
    const { containerEl, addColumnModalManager } = response;
    const { columnState, dataState, view, configState } = addColumnModalManager.props;
    const { addColumnModal } = addColumnModalManager;
    /******************
     * SHOW COLUMN MENU
     ******************/
    containerEl.createEl("h3", { text: this.settingTitle });
    const typesRecord: Record<string, string> = {};
    Object.values(DynamicInputType).forEach((value) => {
      typesRecord[value] = t(value);
    });
    // List of columns to show/hide
    columnState.info.getAllColumns()
      .filter(c => !c.skipPersist)
      .sort((a, b) => a.position - b.position)
      .forEach((column) => {
        const toggleHandler = (shown: boolean): void => {
          columnState.actions.alterIsHidden(column, !shown);
          addColumnModalManager.addColumnModal.enableReset = true;
        }

        const openSettingsHandler = async (): Promise<void> => {
          addColumnModal.close();
          new ColumnSettingsModal({
            dataState: dataState,
            columnState: columnState,
            configState: configState,
            view: view,
            tableColumn: column,
          }).open();
        }

        const selectTypeHandler = (value: string): void => {
          if (column.input === value || !value) return;
          columnState.actions.alterColumnType(column, value);
          addColumnModalManager.addColumnModal.enableReset = true;
        }
        // Cross column settings
        const columnSetting = new Setting(containerEl)
          .setName(column.label)
          .setDesc(`${t("add_row_modal_quick_options_desc", column.label)}${column.isMetadata ? t("add_row_modal_quick_options_desc_metadata") : ""}`)
          .addToggle(toggle =>
            toggle
              .setValue(!column.isHidden)
              .onChange(toggleHandler)
              .setTooltip(t("add_row_modal_quick_options_desc_tooltip", column.label))
          )
          .addButton(button => {
            button
              .setIcon("gear")
              .setTooltip(t("add_row_modal_quick_options_desc_button_add_tooltip", column.label))
              .onClick(openSettingsHandler)
          });
        // Add extra options for non-metadata columns
        if (!column.isMetadata) {
          // Select type
          columnSetting
            .addDropdown((dropdown) => {
              dropdown.addOptions(typesRecord);
              dropdown.setValue(column.input);
              dropdown.onChange(selectTypeHandler);
            });
          // Delete column
          columnSetting
            .addButton(button => {
              button
                .setIcon("trash")
                .setTooltip(t("add_row_modal_quick_options_desc_button_delete_tooltip", column.label))
                .onClick(async () => {
                  const confirmation = await new ConfirmModal()
                    .setMessage(t(
                      "add_row_modal_quick_options_desc_button_delete_notice_confirm",
                      column.label
                    ))
                    .isConfirmed();
                  if (confirmation) {
                    columnState.actions.remove(column);
                    // Refresh the modal to remove the selected column from the dropdown
                    addColumnModalManager.reset(response);
                  }
                })
            });
        }
      });
    return this.goNext(response);
  }
}
