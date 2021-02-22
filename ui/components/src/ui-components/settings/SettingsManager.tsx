/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Settings
 */

import { BeUiEvent, Logger } from "@bentley/bentleyjs-core";
import { ConditionalBooleanValue } from "@bentley/ui-abstract";
import { UiComponents } from "../UiComponents";

/** @alpha */
export interface SettingsEntry {
  /** unique id for entry */
  readonly tabId: string;
  /** localized display label */
  readonly label: string;
  /** Setting page content to display when tab item is selected. */
  readonly page: JSX.Element;
  /** used to determine position in tablist */
  readonly itemPriority: number;
  /** Optional Subtitle to show below label. */
  readonly subLabel?: string;
  /** Icon specification */
  readonly icon?: string | JSX.Element;
  /** Tooltip. Allows JSX|Element to support react-tooltip component */
  readonly tooltip?: string | JSX.Element;
  /** Allows Settings entry to be disabled */
  readonly isDisabled?: boolean | ConditionalBooleanValue;
}

/** Event class for [[this.onSettingsProvidersChanged]].
 * @internal
 */
export class SettingsProvidersChangedEvent extends BeUiEvent<SettingsProvidersChangedEventArgs> { }

/** Arguments of [[this.onSettingsProvidersChanged]] event.
 * @internal
 */
export interface SettingsProvidersChangedEventArgs {
  readonly providers: ReadonlyArray<SettingsProvider>;
}

/** Setting Provider interface.
 * @alpha
 */
export interface SettingsProvider {
  /** Id of provider */
  readonly id: string;
  getSettingEntries(stageId: string, stageUsage: string): ReadonlyArray<SettingsEntry> | undefined;
}

/** Settings Manager class.
 * @alpha
 */
export class SettingsManager {
  private _providers: ReadonlyArray<SettingsProvider> = [];

  /** Event raised when SettingsProviders are changed.
   * @internal
   */
  public readonly onSettingsProvidersChanged = new SettingsProvidersChangedEvent();

  /** @internal */
  public get providers(): ReadonlyArray<SettingsProvider> { return this._providers; }
  public set providers(p: ReadonlyArray<SettingsProvider>) {
    this._providers = p;
    this.onSettingsProvidersChanged.emit({ providers: p });
  }

  public addSettingsProvider(settingsProvider: SettingsProvider): void {
    const foundProvider = this._providers.find((p) => p.id === settingsProvider.id);
    if (!foundProvider) {
      const updatedProviders = [
        ...this.providers,
        settingsProvider,
      ];
      this.providers = updatedProviders;
    } else {
      Logger.logInfo(UiComponents.loggerCategory(UiComponents), `Settings Provider with id of ${settingsProvider.id} has already been registered`);
    }
  }

  public removeSettingsProvider(providerId: string): boolean {
    let result = false;
    const updatedProviders = this._providers.filter((p) => p.id !== providerId);
    if (updatedProviders.length !== this._providers.length) {
      this.providers = updatedProviders;
      result = true;
    }

    return result;
  }

  /** Get an array of SettingsEntry objects to populate the settings container. */
  public getSettingEntries(stageId: string, stageUsage: string): Array<SettingsEntry> | undefined {
    const allSettingEntries: SettingsEntry[] = [];
    // Consult the registered SettingsProviders
    this._providers.forEach((p) => {
      const entries = p.getSettingEntries(stageId, stageUsage);
      if (entries) {
        allSettingEntries.push(...entries);
      }
    });

    return allSettingEntries.length > 0 ? allSettingEntries : undefined;
  }
}