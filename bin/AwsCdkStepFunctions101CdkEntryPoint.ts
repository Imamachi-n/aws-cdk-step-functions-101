#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { StepFunctionsStack } from "../stacks/StepFunctions";

const app = new cdk.App();
new StepFunctionsStack(app, "AwsCdkStepFunctions101-Stack");
