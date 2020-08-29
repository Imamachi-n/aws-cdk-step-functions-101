#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { AwsCdkStepFunctions101Stack } from "../stacks/aws-cdk-step-functions-101-stack";

const app = new cdk.App();
new AwsCdkStepFunctions101Stack(app, "AwsCdkStepFunctions101Stack");
