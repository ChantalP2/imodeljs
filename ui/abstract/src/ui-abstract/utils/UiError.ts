/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Utilities
 */

import { BentleyError, BentleyStatus, GetMetaDataFunction, LogFunction, Logger } from "@bentley/bentleyjs-core";

/** iModel.js UI UiError class is a subclass of BentleyError. Errors are logged.
 * @public
 */
export class UiError extends BentleyError {

  /** Constructs UiError using BentleyError. */
  public constructor(category: string, message: string, errorNumber: number = BentleyStatus.ERROR, log: LogFunction = Logger.logError, getMetaData?: GetMetaDataFunction | undefined) {
    super(errorNumber, message, log, category, getMetaData);
  }
}
