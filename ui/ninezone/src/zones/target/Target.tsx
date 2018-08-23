/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
/** @module Zone */

import * as classnames from "classnames";
import * as React from "react";

import CommonProps from "../../utilities/Props";
import "./Target.scss";

export interface TargetProps extends CommonProps {
  onTargetChanged?: (isTargeted: boolean) => void;
}

export default class Target extends React.Component<TargetProps> {
  private _isTargeted = false;

  public componentWillUnmount() {
    if (this._isTargeted)
      this.props.onTargetChanged && this.props.onTargetChanged(false);
  }

  public render() {
    const className = classnames(
      "nz-zones-target-target",
      this.props.className);

    return (
      <div
        className={className}
        style={this.props.style}
        onMouseEnter={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        {this.props.children}
      </div>
    );
  }

  private _handleMouseEnter = () => {
    this._isTargeted = true;
    this.props.onTargetChanged && this.props.onTargetChanged(true);
  }

  private _handleMouseLeave = () => {
    this._isTargeted = false;
    this.props.onTargetChanged && this.props.onTargetChanged(false);
  }
}
