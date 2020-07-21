/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import { mount, shallow } from "enzyme";
import * as React from "react";
import sinon from "sinon";
import { PrimitiveValue } from "@bentley/ui-abstract";
import { EditorContainer, PropertyUpdatedArgs } from "../../ui-components/editors/EditorContainer";
import { ImageCheckBoxEditor } from "../../ui-components/editors/ImageCheckBoxEditor";
import TestUtils from "../TestUtils";

describe("<ImageCheckBoxEditor />", () => {
  it("should render", () => {
    mount(<ImageCheckBoxEditor />);
  });

  it("renders correctly", () => {
    shallow(<ImageCheckBoxEditor />).should.matchSnapshot();
  });

  it("getValue returns proper value after componentDidMount & setState", async () => {
    const record = TestUtils.createImageCheckBoxProperty("Test", false);
    const wrapper = mount(<ImageCheckBoxEditor propertyRecord={record} />);

    await TestUtils.flushAsyncOperations();
    const editor = wrapper.instance() as ImageCheckBoxEditor;
    expect(editor.state.checkboxValue).to.equal(false);
    await TestUtils.flushAsyncOperations();

    wrapper.unmount();
  });

  it("HTML input onChange updates boolean value", async () => {
    const record = TestUtils.createImageCheckBoxProperty("Test1", false);
    const spyOnCommit = sinon.spy();
    function handleCommit(_commit: PropertyUpdatedArgs): void {
      spyOnCommit();
    }
    const wrapper = mount(<ImageCheckBoxEditor propertyRecord={record} onCommit={handleCommit} />);
    await TestUtils.flushAsyncOperations();
    const editor = wrapper.instance() as ImageCheckBoxEditor;
    const inputNode = wrapper.find("input");

    expect(inputNode.length).to.eq(1);
    if (inputNode) {
      const testValue = true;
      inputNode.simulate("change", { target: { checked: testValue } });
      wrapper.update();
      expect(editor.state.checkboxValue).to.equal(testValue);
      await TestUtils.flushAsyncOperations();
      expect(spyOnCommit.calledOnce).to.be.true;
    }
    wrapper.unmount();
  });

  it("onCommit should be called for Space", async () => {
    let booleanValue = false;
    const propertyRecord = TestUtils.createImageCheckBoxProperty("Test2", booleanValue);
    const spyOnCommit = sinon.spy();
    function handleCommit(commit: PropertyUpdatedArgs): void {
      booleanValue = (commit.newValue as PrimitiveValue).value as boolean;
      spyOnCommit();
    }
    const wrapper = mount(<EditorContainer propertyRecord={propertyRecord} title="abc" onCommit={handleCommit} onCancel={() => { }} />);
    const inputNode = wrapper.find("input");
    expect(inputNode.length).to.eq(1);

    const testValue = true;
    inputNode.simulate("change", { target: { checked: testValue } });

    await TestUtils.flushAsyncOperations();
    expect(spyOnCommit.calledOnce).to.be.true;
    expect(booleanValue).to.be.true;
    wrapper.unmount();
  });

  it("componentDidUpdate updates the value", async () => {
    const record = TestUtils.createImageCheckBoxProperty("Test", false);
    const wrapper = mount(<ImageCheckBoxEditor propertyRecord={record} />);

    await TestUtils.flushAsyncOperations();
    const editor = wrapper.instance() as ImageCheckBoxEditor;
    expect(editor.state.checkboxValue).to.equal(false);

    const newRecord = TestUtils.createImageCheckBoxProperty("Test", true);
    wrapper.setProps({ propertyRecord: newRecord });
    await TestUtils.flushAsyncOperations();
    expect(editor.state.checkboxValue).to.equal(true);

    wrapper.unmount();
  });

});