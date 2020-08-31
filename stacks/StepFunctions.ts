import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";

export class StepFunctionsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const taskFn = new lambda.Function(this, "taskFn", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("handlers"),
      handler: "task.handler",
    });

    const firstState = new tasks.LambdaInvoke(this, "最初の処理", {
      lambdaFunction: taskFn,
      outputPath: "$.Payload",
    });
    const secondState = new tasks.LambdaInvoke(this, "次の処理", {
      inputPath: "$.message",
      lambdaFunction: taskFn,
    });

    const definition = firstState.next(secondState);

    new sfn.StateMachine(this, "stateMachine", {
      definition: definition,
    });
  }
}
