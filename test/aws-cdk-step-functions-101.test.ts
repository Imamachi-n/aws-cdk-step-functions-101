import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import AwsCdkStepFunctions101 = require("../stacks/StepFunctions");

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new AwsCdkStepFunctions101.AwsCdkStepFunctions101Stack(
    app,
    "MyTestStack"
  );
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
