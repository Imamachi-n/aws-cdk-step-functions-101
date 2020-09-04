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
    // lambda関数を作成
    const taskFn = this.createLambdaFn("basicLambdaFn", "task.basicLambdaFn");

    // Step Functionsの入出力 & 使用するLambda関数を定義
    const firstState = new tasks.LambdaInvoke(this, "最初の処理", {
      lambdaFunction: taskFn,
      outputPath: "$.Payload",
    });
    const secondState = new tasks.LambdaInvoke(this, "次の処理", {
      inputPath: "$",
      lambdaFunction: taskFn,
    });

    // パイプラインの定義
    const basicDefinition = firstState.next(secondState);

    // ステートマシン（Step Functions）の作成
    new sfn.StateMachine(this, "stateMachine", {
      definition: basicDefinition,
    });
  }

  // 並列処理を使った Step Functions
  private parallelSfn() {
    const parallel1taskFn = this.createLambdaFn(
      "parallel1LambdaFn",
      "task.parallel1LambdaFn"
    );
    const parallel2taskFn = this.createLambdaFn(
      "parallel2LambdaFn",
      "task.parallel2LambdaFn"
    );
    const finalTaskFn = this.createLambdaFn(
      "finalLambdaFn",
      "task.finalLambdaFn"
    );

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

  // 条件分岐を使った Step Functions

  // Lambda作成用関数
  private createLambdaFn(fnName: string, handler: string) {
    return new lambda.Function(this, fnName, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("dist/src"),
      handler: handler,
    });
  }
}
