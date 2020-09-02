import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";

export class StepFunctionsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.basicSfn();
    this.parallelSfn();
  }

  // シーケンシャルステップを持つ基本的な Step Functions
  // MEMO: task の名前も含めてユニークな名前にする必要がある。
  private basicSfn() {
    const taskFn = new lambda.Function(this, "basicLambdaFn", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("dist/src"),
      handler: "task.basicLambdaFn",
    });

    const firstState = new tasks.LambdaInvoke(this, "最初の処理", {
      lambdaFunction: taskFn,
      outputPath: "$.Payload",
    });
    const secondState = new tasks.LambdaInvoke(this, "次の処理", {
      inputPath: "$",
      lambdaFunction: taskFn,
    });

    const basicDefinition = firstState.next(secondState);

    new sfn.StateMachine(this, "stateMachine", {
      definition: basicDefinition,
    });
  }

  // 並列処理を使った Step Functions
  private parallelSfn() {
    const parallel1taskFn = new lambda.Function(this, "parallel1LambdaFn", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("dist/src"),
      handler: "task.parallel1LambdaFn",
    });
    const parallel2taskFn = new lambda.Function(this, "parallel2LambdaFn", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("dist/src"),
      handler: "task.parallel2LambdaFn",
    });
    const finalTaskFn = new lambda.Function(this, "finalLambdaFn", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("dist/src"),
      handler: "task.finalLambdaFn",
    });

    const parallelState1 = new tasks.LambdaInvoke(this, "並列処理１", {
      lambdaFunction: parallel1taskFn,
      outputPath: "$.Payload",
    });
    const parallelState2 = new tasks.LambdaInvoke(this, "並列処理２", {
      lambdaFunction: parallel2taskFn,
      outputPath: "$.Payload",
    });
    const finalState = new tasks.LambdaInvoke(this, "最後の処理", {
      inputPath: "$",
      lambdaFunction: finalTaskFn,
    });

    const parallelDefinition = new sfn.Parallel(this, "parallelTasks");
    parallelDefinition.branch(parallelState1, parallelState2).next(finalState);

    new sfn.StateMachine(this, "parallelStateMachine", {
      definition: parallelDefinition,
    });
  }
}
