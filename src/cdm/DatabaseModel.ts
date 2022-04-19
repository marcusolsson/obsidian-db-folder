import { RowType } from "cdm/RowTypeModel"

/** database column */
export type DatabaseColumn = {
    input: string,
    Header: string,
    accessor: string,
    label: string,
    isMetadata: boolean,
    [key: string]: RowType
}

/** database yaml */
export type DatabaseYaml = {
    /** database name */
    name: string,
    /** database description */
    description: string,
    /** database columns */
    columns: Record<string, DatabaseColumn>
}