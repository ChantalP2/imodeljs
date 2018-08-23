/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
import { Point3d, Vector3d } from "../PointVector";
import { CurveCurve, CurveLocationDetailArrayPair } from "../curve/CurveCurveIntersectXY";
import { LineString3d } from "../curve/LineString3d";
import { LineSegment3d } from "../curve/LineSegment3d";
import { Checker } from "./Checker";
import { expect } from "chai";
import { Matrix4d, Map4d } from "../numerics/Geometry4d";
import { Transform } from "../Transform";

function createSamplePerspectiveMaps(): Map4d[] {
  const origin = Point3d.create(-20, -20, -10);
  const vectorU = Vector3d.create(100, 0, 0);
  const vectorV = Vector3d.create(0, 100, 0);
  const vectorW = Vector3d.create(0, 0, 100);

  const transform1 = Transform.createOriginAndMatrixColumns(origin, vectorU, vectorV, vectorW);
  const inverse1 = transform1.inverse()!;
  return [
    Map4d.createIdentity(),
    Map4d.createTransform(inverse1, transform1)!,
    Map4d.createVectorFrustum(origin, vectorU, vectorV, vectorW, 0.8)!];
}
/* tslint:disable:no-console */
function testIntersectionsXY(
  ck: Checker,
  worldToLocal: Matrix4d | undefined,
  intersections: CurveLocationDetailArrayPair, minExpected: number, maxExpected: number) {
  if (ck.testExactNumber(intersections.dataA.length, intersections.dataB.length, "intersections A B match")) {
    const n = intersections.dataA.length;
    if (n < minExpected || n > maxExpected) {
      ck.announceError("intersction count out of range", n, minExpected, maxExpected);
      return;
    }

    for (let i = 0; i < n; i++) {
      if (worldToLocal) {
        const pointA = worldToLocal.multiplyPoint3d(intersections.dataA[i].point, 1);
        const pointB = worldToLocal.multiplyPoint3d(intersections.dataB[i].point, 1);
        ck.testCoordinate(0, pointA.realDistanceXY(pointB)!, "projected intersections match");
      } else {
        ck.testPoint3dXY(intersections.dataA[i].point, intersections.dataB[i].point, "CLD coordinate match");
      }
      const fA = intersections.dataA[i].fraction;
      const fB = intersections.dataB[i].fraction;
      const cpA = intersections.dataA[i].curve;
      const cpB = intersections.dataB[i].curve;
      if (ck.testPointer(cpA) && cpA
        && ck.testPointer(cpB) && cpB) {
        ck.testPoint3d(cpA.fractionToPoint(fA), intersections.dataA[i].point);
        ck.testPoint3d(cpB.fractionToPoint(fB), intersections.dataB[i].point);
      }
    }
  }
}

describe("CurveCurve", () => {

  it.only("LineLineMapped", () => {
    const ck = new Checker();
    for (const map of createSamplePerspectiveMaps()) {
      const worldToLocal = map.transform0;    // that's world to local.  The perspective frustum forced that.  Seems backwards.
      const segment0 = LineSegment3d.createXYXY(1, 2, 4, 2);
      const segment1 = LineSegment3d.createXYXY(4, 1, 2, 3);
      const intersections = CurveCurve.IntersectionProjectedXY(worldToLocal, segment0, false, segment1, false);
      testIntersectionsXY(ck, worldToLocal, intersections, 1, 1);
    }
    ck.checkpoint("CurveCurve.LineLine");
    expect(ck.getNumErrors()).equals(0);
  });

  it.only("LineLineString", () => {
    const ck = new Checker();
    for (const map of createSamplePerspectiveMaps()) {
      const worldToLocal = map.transform0;    // that's world to local.  The perspective frustum forced that.  Seems backwards.

      const segment0 = LineSegment3d.createXYXY(1, 2, 4, 2);
      const linestring0 = LineString3d.create(Point3d.create(1, 1), Point3d.create(3, 0), Point3d.create(3, 5));
      const linestring1 = LineString3d.create(Point3d.create(2, 4, 2), Point3d.create(4, 1, 0), Point3d.create(2, 5, 0));

      const intersections = CurveCurve.IntersectionProjectedXY(worldToLocal, segment0, false, linestring0, false);
      testIntersectionsXY(ck, worldToLocal, intersections, 1, 1);
      const intersections1 = CurveCurve.IntersectionProjectedXY(worldToLocal, linestring0, false, segment0, false);
      testIntersectionsXY(ck, worldToLocal, intersections1, 1, 1);

      const intersections2 = CurveCurve.IntersectionProjectedXY(worldToLocal, linestring0, false, linestring1, false);
      testIntersectionsXY(ck, worldToLocal, intersections2, 2, 2);

      const intersectionsX = CurveCurve.IntersectionProjectedXY(worldToLocal, segment0, true, linestring0, true);
      testIntersectionsXY(ck, worldToLocal, intersectionsX, 2, 2);
    }
    expect(ck.getNumErrors()).equals(0);
  });
});
